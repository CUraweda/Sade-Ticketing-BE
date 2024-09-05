import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class PaymentsService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.payments.findMany({
      ...q,
      include: { bookings: true },
    });

    if (query.paginate) {
      const countData = await this.db.payments.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.payments.findUnique({ where: { id } });
    return data;
  };

  findByBookingId = async (id) => {
    const data = await this.db.payments.findMany({
      where: {
        bookings: {
          some: { id },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const booking = await this.db.booking.findUnique({
      where: { id: payload.booking_id },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const payment = await this.db.payments.create({
      data: {
        amount_paid: booking.total,
        payment_method: payload.payment_method,
        status: payload.status,
        transaction_id: payload.transaction_id,
        expiry_date: payload.expiry_date,
        bookings: {
          connect: { id: payload.booking_id },
        },
      },
    });

    return payment;
  };

  findById = async (id) => {
    return this.db.payments.findUnique({
      where: { id },
    });
  };

  update = async (id, payload) => {
    const data = await this.db.payments.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.payments.delete({ where: { id } });
    return data;
  };
}

export default PaymentsService;