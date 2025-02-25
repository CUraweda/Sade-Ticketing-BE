import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import { PaymentStatus, PaymentType } from "../payments/payments.validator.js";
import { ClientScheduleStatus } from "../schedule/schedule.validator.js";
import { BalanceType } from "@prisma/client";
import { AttendeeStatus } from "../scheduleattendee/scheduleattendee.validator.js";
import ScheduleService from "../schedule/schedule.service.js";
import DoctorService from "../doctor/doctor.service.js";

class DashboardService extends BaseService {
  #scheduleService;
  #doctorService;

  constructor() {
    super(prism);
    this.#scheduleService = new ScheduleService();
    this.#doctorService = new DoctorService();
  }

  topServices = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = (
      await this.db.service.findMany({
        ...q,
        select: {
          id: true,
          title: true,
          category: {
            select: {
              name: true,
            },
          },
          bookings: {
            where: {
              OR: [
                { status: BookingStatus.ONGOING },
                { status: BookingStatus.COMPLETED },
              ],
            },

            select: {
              invoices: {
                select: {
                  payment: {
                    where: {
                      status: PaymentStatus.SETTLED,
                    },
                    select: {
                      amount_paid: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              bookings: {
                where: {
                  OR: [
                    {
                      status: BookingStatus.ONGOING,
                    },
                    {
                      status: BookingStatus.COMPLETED,
                    },
                  ],
                },
              },
            },
          },
        },
        orderBy: [
          {
            bookings: {
              _count: "desc",
            },
          },
        ],
      })
    )
      .filter((dat) => dat._count.bookings > 0)
      .map((dat) => ({
        ...dat,
        _income: dat.bookings.reduce(
          (a, c) =>
            (a += c.invoices.reduce(
              (a, c) => (a += c.payment?.amount_paid),
              0
            )),
          0
        ),
      }));

    return data;
  };

  totalIncome = async (holder, start, end) => {
    if (!holder) return 0;

    const in_ = await this.db.balance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        holder: holder,
        type: BalanceType.IN,
        ...(start &&
          end && {
            created_at: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });
    const out = await this.db.balance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        holder: holder,
        type: BalanceType.OUT,
        ...(start &&
          end && {
            created_at: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });

    return in_._sum.amount - out._sum.amount;
  };

  totalAmountIssuedInvoice = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = await this.db.invoice.aggregate({
      where: {
        ...q.where,
        status: InvoiceStatus.ISSUED,
      },
      _sum: {
        total: true,
      },
    });

    return data._sum.total;
  };

  countActiveSpecialists = async () => {
    const data = await this.db.doctorProfile.count({
      where: {
        is_active: true,
      },
    });
    return data;
  };

  countActiveBookings = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = await this.db.booking.count({
      where: {
        ...q.where,
        OR: [
          { status: BookingStatus.ONGOING },
          { status: BookingStatus.COMPLETED },
        ],
      },
    });

    return data;
  };

  countOngoingBookingByUser = async (userId) =>
    this.db.booking.count({
      where: {
        status: BookingStatus.ONGOING,
        client: {
          user_id: userId,
        },
      },
    });

  countIssuedInvoices = async (userId) =>
    this.db.invoice.count({
      where: {
        user_id: userId,
        status: InvoiceStatus.ISSUED,
      },
    });

  bookingByServiceCategoryChart = async () => {
    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const bookings = await this.db.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.COMPLETED, BookingStatus.ONGOING],
        },
        created_at: {
          gte: moment().startOf("year"),
          lte: moment().endOf("year").add(1, "day"),
        },
      },
      select: {
        id: true,
        created_at: true,
        service: {
          select: {
            category: {
              select: {
                name: true,
                hex_color: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const series = [];
    const groupedByService = {};

    bookings.forEach((b) => {
      const categoryName = b.service.category?.name;

      if (!categoryName) return;

      if (!groupedByService[categoryName]) {
        groupedByService[categoryName] = {
          data: Array(12).fill(0),
          borderColor: b.service.category?.hex_color ?? "",
          backgroundColor: b.service.category?.hex_color ?? "",
        };
      }

      const bookingMonth = moment(b.created_at).month();
      groupedByService[categoryName].data[bookingMonth] += 1;
    });

    for (const [
      label,
      { data, backgroundColor, borderColor },
    ] of Object.entries(groupedByService)) {
      series.push({ label, data, backgroundColor, borderColor });
    }

    return { labels, series };
  };

  doctorClients = (doctorId, start, end) =>
    this.db.clientProfile.count({
      where: {
        schedules: {
          some: {
            schedule: {
              ...(start &&
                end && {
                  start_date: {
                    gte: moment(start).toDate(),
                    lte: moment(end).toDate(),
                  },
                }),
              doctors: {
                some: {
                  id: doctorId,
                },
              },
            },
          },
        },
      },
    });

  doctorWorkTime = async (doctorId, start, end) => {
    const data = await this.db.schedule.findMany({
      where: {
        doctors: {
          some: {
            id: doctorId,
          },
        },
        AND: [
          this.#scheduleService.completeRuleQuery,
          {
            ...(start &&
              end && {
                start_date: {
                  gte: moment(start).toDate(),
                  lte: moment(end).toDate(),
                },
              }),
          },
        ],
      },
      select: {
        start_date: true,
        end_date: true,
      },
    });

    const minutes = data.reduce(
      (a, c) => (a += moment(c.end_date).diff(moment(c.start_date), "minutes")),
      0
    );

    return minutes;
  };

  doctorCompletedSchedules = async (doctorId, start, end) => {
    const total = await this.db.schedule.count({
      where: {
        doctors: {
          some: {
            id: doctorId,
          },
        },
        ...(start &&
          end && {
            start_date: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });
    const completed = await this.db.schedule.count({
      where: {
        AND: [
          this.#scheduleService.completeRuleQuery,
          {
            ...(start &&
              end && {
                start_date: {
                  gte: moment(start).toDate(),
                  lte: moment(end).toDate(),
                },
              }),
          },
        ],
        doctors: {
          some: {
            id: doctorId,
          },
        },
      },
    });

    return { completed, total };
  };

  doctorServiceStat = async (doctorId, start_date, end_date) => {
    const services = await this.db.service.findMany({
      where: {
        doctors: {
          some: {
            doctor_id: doctorId,
          },
        },
      },
      include: {
        category: true,
        doctors: {
          where: {
            doctor_id: doctorId,
          },
          select: {
            salary: true,
          },
        },
        schedules: {
          where: {
            ...(start_date &&
              end_date && {
                start_date: {
                  gte: moment(start_date).toDate(),
                  lte: moment(end_date).toDate(),
                },
              }),
            doctors: {
              some: {
                id: doctorId,
              },
            },
          },
          include: {
            attendees: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return services.map((s) => {
      const scheduleComplete = s.schedules.filter((sc) =>
        this.#scheduleService.completeRuleFilter(sc)
      ).length;

      return {
        name: s.title,
        category: s.category?.name,
        category_color: s.category?.hex_color,
        schedule_count: s.schedules.length,
        schedule_complete_count: scheduleComplete,
        received_salary:
          scheduleComplete * (s.doctors.length ? s.doctors[0].salary : 0),
      };
    });
  };

  unreadChats = async (userId) =>
    this.db.chat.count({
      where: {
        chatroom: {
          members: {
            some: { user_id: userId },
          },
        },
        user_id: { not: userId },
        readers: { none: { user_id: userId } },
      },
    });

  schedulePresence = async (clientIds = []) => {
    const whole = await this.db.schedule.count({
      where: { attendees: { some: { client_id: { in: clientIds } } } },
    });
    const part = await this.db.schedule.count({
      where: {
        attendees: {
          some: {
            client_id: { in: clientIds },
            status: ClientScheduleStatus.PRESENT,
          },
        },
      },
    });
    return { part, whole };
  };

  scheduleAbsence = async (clientIds = []) =>
    this.db.schedule.count({
      where: {
        start_date: { lte: moment() },
        attendees: { some: { client_id: { in: clientIds }, status: null } },
      },
    });

  scheduleSick = async (clientIds = []) =>
    this.db.schedule.count({
      where: {
        start_date: { lte: moment() },
        attendees: {
          some: {
            client_id: { in: clientIds },
            status: ClientScheduleStatus.SICK,
          },
        },
      },
    });

  schedulePermitted = async (clientIds = []) =>
    this.db.schedule.count({
      where: {
        start_date: { lte: moment() },
        attendees: {
          some: {
            client_id: { in: clientIds },
            status: ClientScheduleStatus.PERMITTED,
          },
        },
      },
    });

  countUpcomingSchedules = async (clientIds = []) =>
    this.db.schedule.count({
      where: {
        start_date: { gte: moment().toDate() },
        attendees: { some: { client_id: { in: clientIds } } },
      },
    });

  totalScheduleQuota = async (clientIds = []) => {
    const res = await this.db.booking.aggregate({
      _sum: { quantity: true },
      where: { client_id: { in: clientIds } },
    });
    return res._sum.quantity;
  };

  inactiveScheduleQuota = async (clientIds = []) =>
    this.db.scheduleAttendee.count({
      where: { client_id: { in: clientIds }, is_active: false },
    });

  activeScheduleQuota = async (clientIds = []) =>
    this.db.scheduleAttendee.count({
      where: { client_id: { in: clientIds }, is_active: true },
    });

  totalDoctorPayroll = async (doctorId, start, end) => {};

  totalServiceSalary = async (doctorId, start, end) => {
    const services = await this.db.service.findMany({
      where: {
        doctors: { some: { doctor_id: doctorId } },
      },
      include: {
        doctors: {
          where: { doctor_id: doctorId },
          select: { salary: true },
        },
        schedules: {
          where: {
            AND: [
              this.#scheduleService.completeRuleQuery,
              {
                ...(start &&
                  end && {
                    start_date: {
                      gte: moment(start).toDate(),
                      lte: moment(end).toDate(),
                    },
                  }),
              },
            ],
            doctors: { some: { id: doctorId } },
          },
          include: {
            attendees: { select: { status: true }, where: { is_active: true } },
          },
        },
      },
    });

    const total = services.reduce((a, c) => {
      const salary = c.doctors.length ? c.doctors[0].salary : 0;
      const completed = c.schedules.length;

      return a + salary * completed;
    }, 0);

    return total;
  };

  totalDoctorWorkDays = async (doctorId, start, end) => {
    const schedules = await this.db.schedule.findMany({
      where: {
        doctors: { some: { id: doctorId } },
        AND: [
          this.#scheduleService.completeRuleQuery,
          {
            ...(start &&
              end && {
                start_date: {
                  gte: moment(start).toDate(),
                  lte: moment(end).toDate(),
                },
              }),
          },
        ],
      },
      select: { start_date: true },
    });

    const totalDays = schedules.map((sc) =>
      moment(sc.start_date).format("YYYY-MM-DD")
    ).length;

    return totalDays;
  };

  estTotalDoctorWorkDays = async (doctorId, start, end) => {
    const schedules = await this.db.schedule.findMany({
      where: {
        doctors: { some: { id: doctorId } },
        AND: [
          {
            ...(start &&
              end && {
                start_date: {
                  gte: moment(start).toDate(),
                  lte: moment(end).toDate(),
                },
              }),
          },
        ],
      },
      select: { start_date: true },
    });

    const totalDays = schedules.map((sc) =>
      moment(sc.start_date).format("YYYY-MM-DD")
    ).length;

    return totalDays;
  };

  totalDoctorTransport = async (doctorId, start, end) => {
    const doctor = await this.#doctorService.findById(doctorId);
    const days = await this.totalDoctorWorkDays(doctorId, start, end);

    const total = (doctor.transport_fee ?? 0) * days;
    return total;
  };

  estTotalDoctorTransport = async (doctorId, start, end) => {
    const doctor = await this.#doctorService.findById(doctorId);
    const days = await this.estTotalDoctorWorkDays(doctorId, start, end);

    const total = (doctor.transport_fee ?? 0) * days;
    return total;
  };

  totalPaymentIncome = async (start, end) => {
    const sum = await this.db.payments.aggregate({
      _sum: { amount_paid: true },
      where: {
        type: PaymentType.IN,
        status: { in: [PaymentStatus.SETTLED, PaymentStatus.COMPLETED] },
        ...(start &&
          end && {
            payment_date: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });

    return sum._sum.amount_paid;
  };

  totalPaymentOutcome = async (start, end) => {
    const sum = await this.db.payments.aggregate({
      _sum: { amount_paid: true },
      where: {
        type: PaymentType.OUT,
        status: { in: [PaymentStatus.SETTLED, PaymentStatus.COMPLETED] },
        ...(start &&
          end && {
            payment_date: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });

    return sum._sum.amount_paid;
  };

  totalPaymentPending = async (start, end) => {
    const sum = await this.db.payments.aggregate({
      _sum: { amount_paid: true },
      where: {
        status: { notIn: [PaymentStatus.SETTLED, PaymentStatus.COMPLETED] },
        ...(start &&
          end && {
            payment_date: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
      },
    });

    return sum._sum.amount_paid;
  };

  totalPaymentsNet = async (start, end) => {
    const income = await this.totalPaymentIncome(start, end);
    const outcome = await this.totalPaymentOutcome(start, end);

    return income - outcome;
  };

  bankChart = async (start, end) => {
    const income = await this.totalPaymentIncome(start, end);
    const outcome = await this.totalPaymentOutcome(start, end);
    const pending = await this.totalPaymentPending(start, end);
    const net = income - outcome;

    const banks = await this.db.bankAccount.findMany({
      include: {
        payments: {
          select: { amount_paid: true, type: true, status: true },
          where: {
            ...(start &&
              end && {
                payment_date: {
                  gte: moment(start).toDate(),
                  lte: moment(end).toDate(),
                },
              }),
          },
        },
      },
    });

    const data = banks.map((b) => {
      const inc = b.payments
        .filter(
          (p) =>
            [PaymentStatus.SETTLED, PaymentStatus.COMPLETED].includes(
              p.status
            ) && p.type == PaymentType.IN
        )
        .reduce((a, c) => (a += c.amount_paid), 0);
      const out = b.payments
        .filter(
          (p) =>
            [PaymentStatus.SETTLED, PaymentStatus.COMPLETED].includes(
              p.status
            ) && p.type == PaymentType.OUT
        )
        .reduce((a, c) => (a += c.amount_paid), 0);
      const pend = b.payments
        .filter(
          (p) =>
            ![PaymentStatus.SETTLED, PaymentStatus.COMPLETED].includes(p.status)
        )
        .reduce((a, c) => (a += c.amount_paid), 0);
      const ne = inc - out;

      return {
        ...b,
        payments: {
          income: { value: inc, percent: (inc / income) * 100 },
          outcome: { value: out, percent: (out / outcome) * 100 },
          pending: { value: pend, percent: (pend / pending) * 100 },
          net: { value: ne, percent: (ne / net) * 100 },
        },
      };
    });

    return data;
  };

  getDaycareOperatingHours = async () => {
    const result = await this.db.daycareOperatingHours.findMany();
    return result;
  };

  countDoctors = async () => {
    const active = await this.db.doctorProfile.groupBy({
      by: "category",
      _count: { id: true },
      where: { is_active: true },
    });

    const inactive = await this.db.doctorProfile.groupBy({
      by: "category",
      _count: { id: true },
      where: { is_active: false },
    });

    const activeMap = Object.fromEntries(
      active.map((d) => [d.category, d._count.id])
    );
    const inactiveMap = Object.fromEntries(
      inactive.map((d) => [d.category, d._count.id])
    );

    const categories = new Set([
      ...Object.keys(activeMap),
      ...Object.keys(inactiveMap),
    ]);

    const result = Array.from(categories).map((category) => ({
      category,
      active: activeMap[category] || 0,
      inactive: inactiveMap[category] || 0,
    }));

    return result;
  };

  countUsers = async () => {
    const active = await this.db.user.count({ where: { status: true } });
    const inactive = await this.db.user.count({ where: { status: false } });

    return { active, inactive };
  };

  countBookings = async () => {
    const byStatus = await this.db.booking.groupBy({
      by: "status",
      _count: { id: true },
    });

    return byStatus.map((b) => ({ status: b.status, count: b._count.id }));
  };

  countDaycareBookings = async () => {
    const byStatus = await this.db.daycareBooking.groupBy({
      by: "status",
      _count: { id: true },
    });

    return byStatus.map((b) => ({ status: b.status, count: b._count.id }));
  };

  countInvoice = async () => {
    const byStatus = await this.db.invoice.groupBy({
      by: "status",
      _count: { id: true },
      _sum: { total: true },
    });

    return byStatus.map((b) => ({
      status: b.status,
      count: b._count.id,
      total: b._sum.total,
    }));
  };
}

export default DashboardService;
