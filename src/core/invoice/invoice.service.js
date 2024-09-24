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
        bookings: {
          include: {
            schedules: true,
          },
        },
        payment: {
          include: {
            bank_account: true,
          },
        },
      },
    });

    data["items"] = data.bookings
      .map((b, _, arr) => {
        return b.schedules.reduce((a, c) => {
          const date = moment(c.start_date).format("YYYY-MM-DD");
          const found = a.find((item) => item.date == date);

          if (found) {
            found.quantity += 1;
            found.total_price = found.quantity * b.price;
          } else
            a.push({
              date,
              service: b.title,
              quantity: 1,
              price: b.price,
              total_price: b.price,
              note: "",
            });

          return a;
        }, []);
      })
      .flat();

    delete data.bookings;

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
}

export default InvoiceService;
