import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { NotFound } from "../../lib/response/catch.js";
import BookingService from "../booking/booking.service.js";

class PaymentsService extends BaseService {
  #bookingService;

  constructor() {
    super(prism);
    this.#bookingService = new BookingService();
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    let data = await this.db.payments.findMany({
      ...q,
      include: this.select([
        "bookings.services.service_data",
        "user.id",
        "user.full_name",
        "user.avatar",
        "user.email",
      ]),
    });

    data = data.map((dat) => {
      return {
        ...dat,
        bookings: undefined,
        items: [
          ...dat.bookings
            .map((b) =>
              b.services
                .map((s) => {
                  const data = this.#bookingService.extractServiceData(
                    s.service_data
                  );
                  return {
                    title: `${data.category?.name ?? "-"} - ${data.title}`,
                  };
                })
                .flat()
            )
            .flat(),
        ],
      };
    });

    if (query.paginate) {
      const countData = await this.db.payments.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findByIdOwner = async (id, user_id) => {
    const data = await this.db.payments.findFirst({
      where: {
        id,
        user_id,
      },
    });
    return data;
  };

  checkOwner = async (id, user_id) => {
    const check = await this.db.payments.count({
      where: { id, user_id },
    });
    if (!check) throw new NotFound();
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

  create = async (payload, invoice_ids) => {
    let total = payload?.amount_paid ?? 0;

    if (invoice_ids.length) {
      total = (
        await this.db.invoice.aggregate({
          where: {
            id: {
              in: payload.invoice_ids,
            },
            user_id: payload.user_id,
          },
          _sum: {
            total: true,
          },
        })
      )._sum.total;
    }

    const data = await this.db.payments.create({
      data: {
        ...payload,
        amount_paid: total,
        invoices: {
          connect: invoice_ids?.map((i) => ({ id: i })) ?? [],
        },
      },
    });

    return data;
  };

  findById = async (id) => {
    return this.db.payments.findUnique({
      where: { id },
      include: this.select(["bank_account"]),
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
