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

  totalIncome = async (holder) => {
    if (!holder) return 0;

    const in_ = await this.db.balance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        holder: holder,
        type: BalanceType.IN,
      },
    });
    const out = await this.db.balance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        holder: holder,
        type: BalanceType.OUT,
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

  doctorClients = (doctorId) =>
    this.db.clientProfile.count({
      where: {
        schedules: {
          some: {
            schedule: {
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

  doctorWorkTime = async (doctorId) => {
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

  doctorCompletedSchedules = async (doctorId) => {
    const total = await this.db.schedule.count({
      where: {
        is_locked: true,
        doctors: {
          some: {
            id: doctorId,
          },
        },
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
      },
    });

    return (completed / total) * 100;
  };

  doctorServiceStat = async (doctorId) => {
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
}

export default DashboardService;
