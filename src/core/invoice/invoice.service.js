import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

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
      },
    });

    // invoice main items
    const items = await this.getItems(id);
    data["items"] = items.items;
    data["items_total"] = items.total;

    return data;
  };

  create = async (payload) => {
    const data = await this.db.invoice.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.invoice.update({ where: { id }, data: payload });
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

    const items = await this.db.$queryRaw`
      SELECT 
        DATE(s.start_date) AS start_date,
        b.title,
        CAST(COUNT(b.id) AS CHAR(32)) AS quantity,
        b.price,
        (b.price * COUNT(b.id)) AS total_price
      FROM 
        Schedule s
      JOIN 
        Booking b ON s.booking_id = b.id
      WHERE
        b.id IN (${bookingIds.join(", ")})
      GROUP BY 
        DATE(s.start_date);
    `;

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.total_price), 0),
    };

    return { items, total };
  };
}

export default InvoiceService;
