import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import { ServiceBillingType } from "../service/service.validator.js";
import { parseJson } from "../../utils/transform.js";

class InvoiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.invoice.findMany({
      ...q,
      include: {
        user: {
          select: {
            avatar: true,
            full_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            fees: true,
          },
        },
      },
    });

    if (query.paginate) {
      const countData = await this.db.invoice.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.invoice.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            bank_account: true,
          },
        },
        fees: {
          include: { fee: true },
        },
        items: true,
        user: {
          select: this.select(["email", "full_name", "id"]),
        },
      },
    });

    return data;
  };

  create = async (payload) => {
    const data = await this.db.invoice.create({
      data: {
        ...payload,
        total:
          payload.items.reduce((a, c) => (a += c.price * c.quantity), 0) +
          payload.fees.reduce((a, c) => (a += c.price * c.quantity), 0),
        items: {
          createMany: {
            data: payload.items,
          },
        },
        fees: {
          createMany: {
            data: payload.fees,
          },
        },
      },
    });

    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.invoice.update({
      where: { id },
      data: {
        ...payload,
        total:
          payload.items.reduce((a, c) => (a += c.price * c.quantity), 0) +
          payload.fees.reduce((a, c) => (a += c.price * c.quantity), 0),
        items: {
          deleteMany: {},
          createMany: {
            data: payload.items,
          },
        },
        fees: {
          deleteMany: {},
          createMany: {
            data: payload.fees,
          },
        },
      },
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.invoice.delete({ where: { id } });
    return data;
  };

  getItems = async (invoice_id, booking_ids) => {
    let bookingIds = booking_ids ? [...booking_ids] : [];

    if (invoice_id) {
      const invoiceBookings = await this.db.invoice.findUnique({
        where: { id: invoice_id },
        select: this.select(["bookings.id"]),
      });
      bookingIds = [...bookingIds, invoiceBookings.bookings.map((b) => b.id)];
    }

    const items = (
      await this.db.booking.findMany({
        where: {
          id: {
            in: bookingIds,
          },
          service: {
            billing_type: ServiceBillingType.ONE_TIME,
          },
        },
        include: {
          schedules: {
            select: {
              start_date: true,
              end_date: true,
            },
            orderBy: {
              start_date: "asc",
            },
          },
        },
      })
    ).map((b) => {
      const service = parseJson(b.service_data);

      const start = b.schedules.length ? b.schedules[0].start_date : null,
        end = b.schedules.length
          ? (b.schedules[b.schedules.length - 1].end_date ??
            b.schedules[b.schedules.length - 1].start_date)
          : null;

      return {
        start_date: start,
        end_date: end,
        name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
        quantity: b.quantity ?? b.schedules.length,
        quantity_unit: service.price_unit,
        price: service.price,
        service_id: service.id,
      };
    });

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.price * c.quantity), 0),
    };

    return { items, total };
  };

  getFees = async (invoice_id, booking_ids) => {
    const bookingIds = booking_ids ? [...booking_ids] : [];
    // list of fee
    const items = [];

    // entry fees
    const entryFees = await this.db.fee.findMany({
      where: {
        services: {
          some: {
            bookings: {
              some: {
                id: {
                  in: bookingIds,
                },
                status: BookingStatus.DRAFT,
              },
            },
          },
        },
      },
    });
    entryFees.forEach((sf) => items.push({ ...sf, quantity: 1 }));

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.price * c.quantity), 0),
    };

    return { items, total };
  };
}

export default InvoiceService;
