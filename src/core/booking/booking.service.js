import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { doctorFields } from "../../data/model-fields.js";
import { BadRequest, Forbidden } from "../../lib/response/catch.js";
import { BookingStatus } from "./booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import InvoiceService from "../invoice/invoice.service.js";
import { ServiceBillingType } from "../service/service.validator.js";

class BookingService extends BaseService {
  #invoiceService;

  constructor() {
    super(prism);
    this.#invoiceService = new InvoiceService();
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = (
      await this.db.booking.findMany({
        ...q,
        include: this.select([
          "client.first_name",
          "client.last_name",
          "client.avatar",
          "client.category",
          "client.dob",
        ]),
      })
    ).map((dat) => ({
      ...dat,
      service_data: this.extractServiceData(dat.service_data),
    }));

    if (query.paginate) {
      const countData = await this.db.booking.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.booking.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            agreed_documents: true,
            questionnaire_responses: true,
            reports: true,
            schedules: true,
            service_recommendations: true,
            files: true,
          },
        },
        files: true,
        service: {
          select: { fees: true },
        },
        invoices: true,
        user: { select: { avatar: true, full_name: true, email: true } },
        client: true,
        agreed_documents: {
          include: this.select(["document.title"]),
        },
        questionnaire_responses: {
          include: this.select(["questionnaire.title"]),
        },
        reports: {
          include: this.select(["questionnaire.title"]),
        },
        schedules: {
          orderBy: { schedule: { start_date: "desc" } },
          include: {
            _count: { select: { invoices: true } },
            booking: {
              select: {
                service_data: true,
              },
            },
            schedule: {
              select: {
                start_date: true,
                end_date: true,
                service: {
                  select: { title: true, category: true },
                },
              },
            },
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const service = await this.db.service.findFirst({
      where: {
        id: payload.service_id,
        is_active: true,
      },
      select: {
        id: true,
        category: true,
        location: true,
        title: true,
        price: true,
        price_unit: true,
        questionnaires: true,
        agrement_documents: true,
        files: true,
      },
    });
    const { files, agrement_documents, questionnaires, ...rest } = service;
    const { recommendation_id, ...restPayload } = payload;

    const data = await this.db.booking.create({
      data: {
        ...restPayload,
        service_recommendations: {
          connect: { id: recommendation_id },
        },
        price: rest.price,
        service_data: JSON.stringify(rest) ?? "",
        status: BookingStatus.DRAFT,
        title: `${rest.category?.name ?? ""} - ${rest.title}`,
        files: {
          create: files?.map((f) => ({
            title: f.title,
            type: f.type,
          })),
        },
        questionnaire_responses: {
          create: questionnaires?.map((que) => ({
            user_id: payload.user_id,
            client_id: payload.client_id,
            questionnaire_id: que.id,
          })),
        },
        agreed_documents: {
          create: agrement_documents?.map((doc) => ({
            document_id: doc.id,
          })),
        },
      },
    });

    return data;
  };

  update = async (id, payload) => {
    if (payload.quantity) {
      const data = await this.findById(id);
      payload["quantity"] =
        payload.quantity < data.quantity ? data.quantity : payload.quantity;
    }

    const result = await this.db.booking.update({
      where: { id },
      data: payload,
    });
    return result;
  };

  delete = async (id) => {
    const data = await this.db.booking.delete({ where: { id } });
    return data;
  };

  extractServiceData = (data, keys = []) => {
    const json = JSON.parse(data);
    return keys.length
      ? Object.fromEntries(
          Object.entries(json).filter(([key]) => !keys.includes(key))
        )
      : json;
  };

  checkBookingOwner = async (id, user_id) => {
    const find = await this.db.booking.findFirst({
      where: { id, user_id },
    });
    if (!find) throw new Forbidden();
    return find;
  };

  userConfirm = async (ids, payload) => {
    const requestedSchedules = await this.db.schedule.findMany({
      where: { bookings: { some: { id: { in: ids } } } },
      select: {
        id: true,
        start_date: true,
        max_bookings: true,
        _count: {
          select: {
            bookings: { where: { status: { not: BookingStatus.DRAFT } } },
          },
        },
      },
    });

    const blockedSchedules = [];
    requestedSchedules.forEach((rsc) => {
      if (rsc._count.bookings >= rsc.max_bookings) blockedSchedules.push(rsc);
    });

    if (blockedSchedules.length) {
      for (const id of ids) {
        await this.db.booking.update({
          where: { id },
          data: {
            schedules: {
              disconnect: blockedSchedules.map((bsc) => ({ id: bsc.id })),
            },
          },
        });
      }
      throw new BadRequest(
        `Jadwal pada tanggal ${blockedSchedules.map((s) => moment(s.start_date).format("DD MMM YYYY")).join(", ")} sudah penuh. Silakan pilih jadwal lain yang masih tersedia.`
      );
    }

    const items = await this.#invoiceService.getItems(null, ids);
    const fees = await this.#invoiceService.getFees(null, ids);

    await this.db.$transaction(async (db) => {
      await db.invoice.create({
        data: {
          user_id: payload.user_id,
          title: "Tagihan layanan",
          total: items.total.price + fees.total.price,
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add({ hour: 3 }).toDate(),
          items: {
            createMany: {
              data: items.items,
            },
          },
          bookings: {
            connect: ids.map((id) => ({ id })),
          },
          fees: {
            createMany: {
              data: fees.items.map((f) => ({
                fee_id: f.id,
                name: f.title,
                price: f.price,
                quantity: f.quantity,
              })),
            },
          },
        },
      });

      await db.booking.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          status: BookingStatus.NEED_PAYMENT,
          is_locked: true,
        },
      });
    });
  };

  adminConfirm = async (id) => {
    await this.db.$transaction(async (db) => {
      const upBooking = await db.booking.update({
        where: {
          id,
          is_locked: true,
        },
        include: {
          schedules: {
            select: {
              id: true,
            },
          },
        },
        data: {
          status: BookingStatus.ONGOING,
        },
      });

      if (!upBooking) return;

      for (let schId of upBooking.schedules.map((sc) => sc.id)) {
        const schedule = await db.schedule.update({
          where: {
            id: schId,
            bookings: {
              some: {
                id: upBooking.id,
              },
            },
          },
          data: {
            clients: {
              create: {
                client_id: upBooking.client_id,
              },
            },
          },
          select: {
            max_bookings: true,
            _count: {
              select: {
                bookings: {
                  where: { status: BookingStatus.ONGOING },
                },
              },
            },
          },
        });

        if (schedule._count.bookings >= schedule.max_bookings)
          await db.schedule.update({
            where: { id: schId },
            data: { is_locked: true },
          });
      }
    });
  };

  findAllQueResponse = async (booking_id, query) => {
    const q = this.transformBrowseQuery(query);

    const data = await this.db.questionnaireResponse.findMany({
      ...q,
      where: {
        ...q.where,
        OR: [{ booking_id: booking_id }, { booking_report_id: booking_id }],
      },
      include: this.select(["questionnaire.title"]),
    });

    if (query.paginate) {
      const countData = await this.db.questionnaireResponse.count({
        where: { ...q.where, booking_id },
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  createReportResponse = async (uid, booking_id, questionnaire_id) => {
    const booking = await this.db.booking.findUnique({
      where: {
        id: booking_id,
      },
    });

    const result = await this.db.questionnaireResponse.create({
      data: {
        user_id: uid,
        booking_report_id: booking_id,
        client_id: booking.client_id,
        questionnaire_id,
      },
    });
    return result;
  };

  updateAgreementDocument = async (id, document_id, payload) => {
    await this.db.booking.update({
      where: { id },
      data: {
        agreed_documents: {
          update: {
            where: {
              booking_id_document_id: {
                booking_id: id,
                document_id: document_id,
              },
            },
            data: payload,
          },
        },
      },
    });
  };

  getCurrentSchedule = async (id) => {
    const booking = await this.findById(id);

    return await this.db.schedule.findMany({
      where: {
        start_date: { lte: moment().toDate() },
        end_date: { gte: moment().toDate() },
        bookings: {
          some: { id },
        },
        clients: {
          some: { client_id: booking.client_id },
        },
      },
      select: this.select([
        "id",
        "start_date",
        "end_date",
        "title",
        "clients.status",
        "clients.note",
        "clients.client_id",
      ]),
    });
  };

  getScheduleQuota = async (id) => {
    const booking = await this.db.booking.findFirst({
      where: { id },
      select: { quantity: true, _count: { select: { schedules: true } } },
    });

    return {
      target: booking.quantity,
      used: booking._count.schedules,
      remaining: booking.quantity - booking._count.schedules,
    };
  };

  getFile = (id, fileId) =>
    this.db.bookingFile.findFirst({
      where: { id: fileId, booking_id: id },
    });

  updateFile = (id, fileId, filePath) =>
    this.db.bookingFile.update({
      where: { id: fileId, booking_id: id },
      data: { path: filePath },
    });

  getDocuments = async (ids = []) => {
    const data = await this.db.booking.findMany({
      where: { id: { in: ids } },
      select: {
        agreed_documents: {
          include: { document: { select: { title: true } } },
        },
        reports: {
          include: { questionnaire: { select: { title: true } } },
        },
        questionnaire_responses: {
          include: { questionnaire: { select: { title: true } } },
        },
        files: true,
      },
    });

    const result = {
      agreements: [],
      que_output: [],
      que_input: [],
      file_output: [],
      file_input: [],
    };

    data.forEach((booking) => {
      result.agreements.push(...booking.agreed_documents);
      result.que_output.push(...booking.reports);
      result.que_input.push(...booking.questionnaire_responses);
      result.file_output.push(
        ...booking.files.filter((f) => f.type === "output")
      );
      result.file_input.push(
        ...booking.files.filter((f) => f.type === "input")
      );
    });

    return result;
  };
}

export default BookingService;
