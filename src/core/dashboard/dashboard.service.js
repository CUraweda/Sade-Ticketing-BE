import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import { PaymentStatus } from "../payments/payments.validator.js";
import { ClientScheduleStatus } from "../schedule/schedule.validator.js";
import { BalanceType } from "@prisma/client";

class DashboardService extends BaseService {
  constructor() {
    super(prism);
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
      const categoryName = b.service.category.name;

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
        clients: {
          some: {
            status: ClientScheduleStatus.PRESENT,
          },
        },
        doctors: {
          some: {
            id: doctorId,
          },
        },
        end_date: {
          not: null,
        },
        ...(start &&
          end && {
            start_date: {
              gte: moment(start).toDate(),
              lte: moment(end).toDate(),
            },
          }),
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
        is_locked: true,
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
        bookings: {
          every: {
            status: BookingStatus.COMPLETED,
          },
        },
        is_locked: true,
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

    return (completed / total) * 100;
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
            bookings: {
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
        sc.bookings.every((b) => b.status == BookingStatus.COMPLETED)
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
      where: { clients: { some: { client_id: { in: clientIds } } } },
    });
    const part = await this.db.schedule.count({
      where: {
        clients: {
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
        clients: { some: { client_id: { in: clientIds }, status: null } },
      },
    });

  scheduleSick = async (clientIds = []) =>
    this.db.schedule.count({
      where: {
        start_date: { lte: moment() },
        clients: {
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
        clients: {
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
        clients: { some: { client_id: { in: clientIds } } },
      },
    });
}

export default DashboardService;
