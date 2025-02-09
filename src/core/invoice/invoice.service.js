import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";
import {
  ServiceBillingType,
  ServiceFeeType,
} from "../service/service.validator.js";
import { parseJson } from "../../utils/transform.js";
import fs from "fs";
import ScheduleService from "../schedule/schedule.service.js";
import SettingService from "../setting/setting.service.js";
import { SettingKeys } from "../setting/setting.validator.js";
import { DaycareBookingStatus } from "../daycarebooking/daycarebooking.validator.js";
import { InvoiceStatus } from "./invoice.validator.js";
import FeeService from "../fee/fee.service.js";
import { TimeCycle } from "../../base/validator.base.js";

class InvoiceService extends BaseService {
  #scheduleService;
  #settingService;
  #feeService;

  constructor() {
    super(prism);
    this.#scheduleService = new ScheduleService();
    this.#settingService = new SettingService();
    this.#feeService = new FeeService();
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
            items: true,
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
        bookings: {
          include: {
            client: true,
          },
        },
      },
    });

    return data;
  };

  create = async (payload) => {
    const { items, ...rest } = payload;
    const result = await this.db.$transaction(async (db) => {
      // create invoice and fees
      const data = await db.invoice.create({
        data: {
          ...rest,
          total:
            items.reduce((a, c) => (a += c.price * c.quantity), 0) +
            rest.fees.reduce((a, c) => (a += c.price * c.quantity), 0),
          fees: {
            createMany: {
              data: rest.fees,
            },
          },
          bookings: {
            connect: payload.bookings?.map((id) => ({ id })),
          },
          daycare_bookings: {
            connect: payload.daycare_bookings?.map((id) => ({ id })),
          },
        },
      });

      // create items
      for (const item of items) {
        await db.invoiceItem.create({
          data: {
            ...item,
            invoice_id: data.id,
            attendees: {
              connect: item.attendees?.map((id) => ({ id })),
            },
          },
        });
      }

      return data;
    });

    return result;
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

  generateItems = async (
    userId,
    bookingIds = [],
    { startDate, endDate, daycareBookingIds } = {}
  ) => {
    const items = [];

    // collect any invoice-able from bookings
    const bookings = await this.db.booking.findMany({
      where: {
        ...(bookingIds.length && { id: { in: bookingIds } }),
        user_id: userId,
      },
      include: {
        schedules: {
          where: {
            is_active: false,
            invoices: { none: {} },
            schedule_id: { not: null },
          },
          include: {
            schedule: { select: { start_date: true } },
          },
        },
      },
    });

    bookings.forEach((b) => {
      const service = parseJson(b.service_data);

      const schedules = b.schedules
        .filter((sc) =>
          startDate
            ? moment(sc.schedule?.start_date).isSameOrAfter(moment(startDate))
            : true
        )
        .filter((sc) =>
          endDate
            ? moment(sc.schedule?.start_date).isSameOrBefore(moment(endDate))
            : true
        );

      if (schedules.length) {
        items.push({
          attendees: schedules.map((sc) => sc.id),
          dates: schedules.map((sc) => sc.schedule.start_date).join(","),
          name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
          quantity: schedules.length,
          quantity_unit: service.price_unit,
          price: service.price,
          service_id: service.id,
        });
      }
    });

    // collect any invoice-able from daycare bookings
    const dcBookings = await this.db.daycareBooking.findMany({
      where: {
        ...(daycareBookingIds?.length && { id: { in: daycareBookingIds } }),
        user_id: userId,
      },
      include: {
        invoices: true,
        sitin_forms: true,
        price: true,
      },
    });

    if (dcBookings.length) {
      const sitIn = await this.#settingService.getValue(
        SettingKeys.DAYCARE_SITIN_COST
      );
      dcBookings.forEach((b) => {
        // first billing for monthly
        if (
          b.invoices.length == 1 &&
          b.status == DaycareBookingStatus.DRAFT &&
          b.price &&
          b.price.invoice_cycle == TimeCycle.MONTHLY
        )
          items.push({
            dates: `${moment().toDate()}`,
            name: `${b.price.title} Daycare ${moment().locale("id").format("MMMM")}`,
            quantity: 1,
            price: b.price.price,
          });

        if (
          !b.invoices.length &&
          b.sitin_forms.every((sf) => sf.is_locked) &&
          sitIn
        )
          // sit in
          items.push({
            dates: `${moment().toDate()}`,
            name: "Biaya Sit In Daycare",
            quantity: 1,
            price: parseFloat(sitIn.value),
          });
      });
    }

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.price * c.quantity), 0),
    };

    return { items, total };
  };

  generateFees = async (
    userId,
    bookingIds = [],
    { daycareBookingIds } = {}
  ) => {
    const items = [];

    // collect any entry fees from bookings
    const bookings = await this.db.booking.findMany({
      where: {
        ...(bookingIds.length && { id: { in: bookingIds } }),
        user_id: userId,
        status: BookingStatus.DRAFT,
      },
      include: {
        service: { include: { fees: { include: { fee: true } } } },
        questionnaire_responses: true,
        invoices: true,
        schedules: { include: { _count: { select: { invoices: true } } } },
      },
    });
    bookings.forEach((b) => {
      if (
        b.questionnaire_responses.every((qr) => qr.is_locked) &&
        b.schedules.length == 0 &&
        b.invoices.length == 0
      )
        b.service.fees
          .filter((f) => f.type == ServiceFeeType.SITIN)
          .forEach((sf) =>
            items.push({
              fee_id: sf.fee_id,
              name: sf.fee.title,
              quantity: 1,
              price: sf.fee.price,
            })
          );

      if (b.schedules.length > 0 && b.schedules.some((s) => !s._count.invoices))
        b.service.fees
          .filter((f) => f.type == ServiceFeeType.ENTRY)
          .forEach((sf) =>
            items.push({
              fee_id: sf.fee_id,
              name: sf.fee.title,
              quantity: 1,
              price: sf.fee.price,
            })
          );
    });

    // collect any fee able from daycare bookings
    const dcBookings = await this.db.daycareBooking.findMany({
      where: {
        ...(daycareBookingIds?.length && { id: { in: daycareBookingIds } }),
        user_id: userId,
      },
      include: {
        invoices: true,
        sitin_forms: true,
      },
    });

    if (dcBookings) {
      const entryFeeIds = await this.#settingService.getValue(
        SettingKeys.DAYCARE_ENTRY_FEES
      );
      const entryFees = entryFeeIds
        ? await this.#feeService.findAll({
            paginate: false,
            in_: `id:${entryFeeIds.value}`,
          })
        : [];

      dcBookings.forEach((b) => {
        // daycare entry fee
        if (
          b.status == DaycareBookingStatus.DRAFT &&
          b.invoices.length > 0 &&
          b.invoices.every((i) => i.status == InvoiceStatus.PAID) &&
          entryFees.length
        )
          entryFees.forEach((ef) =>
            items.push({
              fee_id: ef.id,
              name: ef.title,
              quantity: 1,
              price: ef.price,
            })
          );
      });
    }

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.price * c.quantity), 0),
    };

    return { items, total };
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
        },
        include: {
          schedules: {
            select: {
              repeat: true,
              repeat_end: true,
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

      const endOfMonth = moment().endOf("month").endOf("day");
      const schedules = this.#scheduleService.generateRepeats(
        b.schedules,
        endOfMonth
      );

      const bookedSchedules = [];
      const start = moment();

      while (
        start.isSameOrBefore(endOfMonth) &&
        bookedSchedules.length < b.quantity
      ) {
        const match = schedules.filter((sc) =>
          moment(sc.start_date).isSame(start, "day")
        );
        match.forEach((m) => bookedSchedules.push(m));
        start.add(1, "day");
      }

      return {
        dates: bookedSchedules.map((bsc) => bsc.start_date).join(","),
        name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
        quantity: bookedSchedules.length,
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

  createOvertime = async (payload) => {
    const data = await this.db.invoice.create({
      data: {
        title: payload.title,
        status: payload.status,
        user_id: payload.user_id,
        total: payload.fees.reduce((a, c) => (a += c.price * c.quantity), 0),
        expiry_date: payload.expiry_date,
        bookings: {
          connect: { id: payload.booking_id },
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

  updateOvertime = async (id, payload) => {
    const data = await this.db.invoice.update({
      where: { id },
      data: {
        title: payload.title,
        status: payload.status,
        user_id: payload.user_id,
        total: payload.fees.reduce((a, c) => (a += c.price * c.quantity), 0),
        expiry_date: payload.expiry_date,
        bookings: {
          connect: { id: payload.booking_id },
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

  export = async (id) => {
    const data = await this.db.invoice.findUnique({
      where: { id },
      select: {
        title: true,
        total: true,
        status: true,
        expiry_date: true,
        paid_date: true,
        note: true,
        payment: {
          select: {
            status: true,
            payment_date: true,
            expiry_date: true,
            note: true,
            bank_account: true,
          },
        },
        fees: {
          select: {
            name: true,
            quantity: true,
            price: true,
          },
        },
        items: {
          select: {
            dates: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
        bookings: {
          select: {
            client: {
              select: {
                first_name: true,
                last_name: true,
                phone_number: true,
                pob: true,
                dob: true,
                sex: true,
              },
            },
            schedules: {
              select: {
                schedule: {
                  select: {
                    start_date: true,
                    end_date: true,
                    title: true,
                    doctors: {
                      select: {
                        first_name: true,
                        last_name: true,
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    data.expiry_date = moment(data.expiry_date)
      .locale("id")
      .format("dddd, DD MMMM YYYY");

    data.items.forEach((i) => {
      i.dates = i.dates
        .split(",")
        .map((d) => moment(d).locale("id").format("dddd, DD/M/YYYY"));
    });

    data.bookings.forEach((b) => {
      b.client.dob = b.client.dob
        ? moment(b.client.dob).format("DD/MM/YYYY")
        : null;

      b.schedules.forEach((s) => {
        s.schedule["day"] = moment(s.schedule.start_date)
          .locale("id")
          .format("dddd");
        s.schedule["start_time"] = moment(s.schedule.start_date)
          .locale("id")
          .format("HH:mm");
        s.schedule["end_time"] = moment(
          s.schedule.start_date ?? s.schedule.end_date
        )
          .locale("id")
          .format("HH:mm");
      });
    });

    return data;
  };
}

export default InvoiceService;
