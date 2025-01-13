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

class InvoiceService extends BaseService {
  #scheduleService;

  constructor() {
    super(prism);
    this.#scheduleService = new ScheduleService();
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
        },
      });

      // create items
      for (const item of items) {
        await db.invoiceItem.create({
          data: {
            ...item,
            invoice_id: data.id,
            attendees: {
              connect: item.attendees.map((id) => ({ id })),
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
    { startDate, endDate } = {}
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

    const total = {
      quantity: items.reduce((a, c) => (a += parseInt(c.quantity)), 0),
      price: items.reduce((a, c) => (a += c.price * c.quantity), 0),
    };

    return { items, total };
  };

  generateFees = async (userId, bookingIds = []) => {
    const items = [];

    // collect any entry fees from bookings
    const bookings = await this.db.booking.findMany({
      where: {
        ...(bookingIds.length && { id: { in: bookingIds } }),
        user_id: userId,
        status: BookingStatus.DRAFT,
      },
      include: {
        service: { include: { fees: true } },
        questionnaire_responses: true,
        invoices: true,
        schedules: true,
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
          .forEach((ef) =>
            items.push({
              fee_id: ef.id,
              name: ef.title,
              quantity: 1,
              price: ef.price,
            })
          );

      if (b.schedules.length > 0 && b.schedules.every((s) => !s.is_active))
        b.service.fees
          .filter((f) => f.type == ServiceFeeType.ENTRY)
          .forEach((ef) =>
            items.push({
              fee_id: ef.id,
              name: ef.title,
              quantity: 1,
              price: ef.price,
            })
          );
    });

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
    const dat = await this.findById(id);
    const logoBinar = fs.readFileSync(
      "src/assets/images/logo-binar.png",
      "base64"
    );

    // common styles
    const tdStyle = {
      marginTop: 8,
      marginBottom: 8,
      border: [0, 0, 0, 1],
      borderColor: ["", "", "", "#d0d0d0"],
    };
    const thStyle = {
      marginTop: 8,
      marginBottom: 8,
      border: [0, 0, 0, 1],
      borderColor: ["", "", "", "#d0d0d0"],
      fontWeight: "bold",
    };

    const itemsTable = [
      [
        { text: "Tanggal", marginLeft: 8, ...thStyle },
        {
          text: "Pembayaran",
          ...thStyle,
        },
        { text: "Jumlah", ...thStyle },
        { text: "Biaya", ...thStyle },
        { text: "Total Biaya", ...thStyle },
      ],
    ];

    const doc = pdfMake.createPdf({
      pageMargins: [40, 120, 40, 72],
      header: [
        {
          margin: 24,
          table: {
            widths: ["25%", "75%"],
            body: [
              [
                {
                  image: `data:image/png;base64,${logoBinar}`,
                  borderColor: ["", "", "", "#c0c0c0"],
                  border: [false, false, false, true],
                  width: 130,
                  marginBottom: 8,
                },
                {
                  borderColor: ["", "", "", "#c0c0c0"],
                  border: [false, false, false, true],
                  marginBottom: 8,
                  stack: [
                    {
                      width: "auto",
                      marginTop: 12,
                      marginBottom: 4,
                      text: "Binar Harmoni Indonesia",
                      fontSize: 18,
                      bold: true,
                    },
                    {
                      text: "Together We Achieve More",
                      fontSize: 12,
                      italics: true,
                      color: "#666",
                    },
                  ],
                },
              ],
            ],
          },
        },
      ],
      footer: (page, totalPage) => ({
        layout: "noBorders",
        margin: 24,
        table: {
          widths: ["85%", "15%"],
          body: [
            [
              {
                fontSize: 10,
                lineHeight: 1.2,
                text: `Jl Bungsan No. 80. Bedahan, Sawangan, Kota Depok. Telp. 087812066496\nJl Gemini Blok A No. I9/10 Kel. Mekarsari, Kec. Tambun Selatan, Kab. Bekasi. Telp. 087812066496`,
                color: "#666",
              },
              {
                text: `${page} dari ${totalPage}`,
                color: "#666",
                alignment: "right",
              },
            ],
          ],
        },
      }),
      content: [
        // title
        {
          fontSize: 14,
          bold: true,
          alignment: "center",
          text: dat?.title,
          marginBottom: 4,
        },
        {
          fontSize: 12,
          color: "#666",
          bold: true,
          alignment: "center",
          text: `${moment(dat.updated_at).format("DD/MM/YYYY")} [${dat.status == "paid" ? "Lunas" : "Belum dibayar"}]`,
        },

        // client information
        {
          layout: "noBorders",
          marginTop: 24,
          marginBottom: 16,
          fontSize: 12,
          color: "#333",
          table: {
            widths: ["20%", "3%", "77%"],
            body: [
              [
                { marginBottom: 4, text: "Nama" },
                { text: ": " },
                {
                  text: `${dat?.bookings?.[0]?.client?.first_name} ${dat?.bookings?.[0]?.client?.last_name ?? ""}`,
                },
              ],
              [
                { marginBottom: 4, text: "Tanggal lahir" },
                { text: ": " },
                {
                  text: `${moment(dat?.bookings?.[0]?.client?.dob).locale("id").format("dddd, DD MMMM YYYY")} (${moment().diff(dat?.bookings?.[0]?.client?.dob, "years")} tahun)`,
                },
              ],
              [
                { marginBottom: 4, text: "Jenis kelamin" },
                { text: ": " },
                {
                  text: `${dat?.bookings?.[0]?.client?.sex == "L" ? "Laki-laki" : "perempuan"}`,
                },
              ],
              [
                { marginBottom: 4, text: "Kategori" },
                { text: ": " },
                { text: dat?.bookings?.[0]?.client?.category },
              ],
              [
                { marginBottom: 4, text: "Hubungan" },
                { text: ": " },
                {
                  text: `${dat?.bookings?.[0]?.client?.relation} dari ${dat?.user.full_name}`,
                },
              ],
              ...(dat?.payment
                ? [
                    [
                      { marginBottom: 4, text: "Rekening Tujuan" },
                      { text: ": " },
                      {
                        text: `${dat.payment.bank_account.provider} - ${dat.payment.bank_account.account_number} - ${dat.payment.bank_account.in_name} - Transfer manual`,
                      },
                    ],
                  ]
                : []),
            ],
          },
        },

        // // table
        {
          fontSize: 12,
          table: {
            widths: ["20%", "20%", "20%", "20%", "20%"],
            body:
              dat?.items?.length || dat?.fees?.length
                ? (dat.items.forEach((item) => {
                    itemsTable.push([
                      {
                        text: item?.start_date
                          ? moment(item?.start_date).format("DD/MM/YYYY")
                          : "-",
                        marginLeft: 8,
                        ...tdStyle,
                      },
                      {
                        text: item?.name || "-",
                        ...tdStyle,
                      },
                      {
                        text: item?.quantity
                          ? `${item.quantity} ${item.quantity_unit}`
                          : "-",
                        ...tdStyle,
                      },
                      {
                        text: item?.price
                          ? new Intl.NumberFormat("id-ID").format(item.price)
                          : "-",
                        ...tdStyle,
                      },
                      {
                        text:
                          item?.price && item?.quantity
                            ? new Intl.NumberFormat("id-ID").format(
                                item.price * item.quantity
                              )
                            : "-",
                        ...tdStyle,
                      },
                    ]);
                  }),
                  dat.fees.forEach((fee) => {
                    itemsTable.push([
                      {
                        text: "-",
                        marginLeft: 8,
                        ...tdStyle,
                      },
                      {
                        text: fee?.name || "-",
                        ...tdStyle,
                      },
                      {
                        text: `${fee?.quantity} Biaya` || "-",
                        ...tdStyle,
                      },
                      {
                        text: fee?.price
                          ? new Intl.NumberFormat("id-ID").format(fee.price)
                          : "-",
                        ...tdStyle,
                      },
                      {
                        text:
                          fee?.price && fee?.quantity
                            ? new Intl.NumberFormat("id-ID").format(
                                fee.price * fee.quantity
                              )
                            : "-",
                        ...tdStyle,
                      },
                    ]);
                  }),
                  itemsTable)
                : [[]],
          },
        },
      ],
    });
    itemsTable.push([
      { text: "", marginLeft: 8, ...thStyle },
      {
        text: "",
        ...thStyle,
      },
      { text: "", ...thStyle },
      { text: "Total Tagihan", color: "#FF995A", bold: true, ...thStyle },
      {
        text: dat?.total
          ? new Intl.NumberFormat("id-ID").format(dat.total)
          : "-",
        ...thStyle,
        color: "#FF995A",
        bold: true,
      },
    ]);

    return { data: dat, doc };
  };
}

export default InvoiceService;
