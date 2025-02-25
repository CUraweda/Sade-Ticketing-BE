import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import { PaymentStatus } from "../payments/payments.validator.js";

class PublicApiService extends BaseService {
  constructor() {
    super(prism);
  }

  getServices = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.service.findMany({
      ...q,
      select: {
        id: true,
        title: true,
        price: true,
        price_unit: true,
        location: true,
        is_active: true,
        category: { select: { name: true, hex_color: true } },
        location: { select: { title: true } },
        fees: {
          include: { fee: true },
        },
        bookings: {
          where: {
            OR: [
              { status: BookingStatus.COMPLETED },
              { status: BookingStatus.ONGOING },
            ],
          },
          select: {
            invoices: {
              where: { status: InvoiceStatus.PAID },
              select: {
                payment: {
                  where: {
                    status: {
                      in: [PaymentStatus.COMPLETED, PaymentStatus.SETTLED],
                    },
                  },
                  select: {
                    amount_paid: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const updatedData = data.map((service) => {
      let income = 0;

      service.bookings.forEach((b) => {
        b.invoices.forEach((i) => {
          income += i.payment?.amount_paid ?? 0;
        });
      });

      delete service.bookings;

      return {
        ...service,
        income,
      };
    });

    if (query.paginate) {
      const countData = await this.db.service.count({ where: q.where });
      return this.paginate(updatedData, countData, q);
    }
    return updatedData;
  };

  countServicesByLocation = async () => {
    const result = await this.db.location.findMany({
      include: { _count: { select: { services: true } } },
    });
    return result;
  };

  countServicesByCategory = async () => {
    const result = await this.db.serviceCategory.findMany({
      include: { _count: { select: { services: true } } },
    });
    return result;
  };
}

export default PublicApiService;
