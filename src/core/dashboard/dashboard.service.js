import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
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
            (a += c.invoices.reduce((a, c) => (a += c.payment.amount_paid), 0)),
          0
        ),
      }));

    return data;
  };
}

export default DashboardService;
