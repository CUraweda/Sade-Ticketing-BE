import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import { PaymentStatus } from "../payments/payments.validator.js";

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

  totalIncome = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = await this.db.payments.aggregate({
      where: {
        ...q.where,
        OR: [
          { status: PaymentStatus.SETTLED },
          { status: PaymentStatus.COMPLETED },
        ],
      },
      _sum: {
        amount_paid: true,
      },
    });

    return data._sum?.amount_paid;
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
}

export default DashboardService;
