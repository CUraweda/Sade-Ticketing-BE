import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { AttendeeStatus } from "./scheduleattendee.validator.js";

class ScheduleAttendeeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.scheduleAttendee.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.scheduleAttendee.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.scheduleAttendee.findUnique({
      where: { id },
      include: {
        client: {
          select: { first_name: true, last_name: true },
        },
        booking: true,
        schedule: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const booking = await this.db.booking.findUnique({
      where: { id: payload.booking_id },
      select: { client_id: true },
    });
    const data = payload.schedules.map((sc) => ({
      ...sc,
      booking_id: payload.booking_id,
      client_id: booking.client_id,
    }));
    const result = await this.db.scheduleAttendee.createMany({
      data,
      skipDuplicates: true,
    });
    return result;
  };

  update = async (id, payload) => {
    const data = await this.db.scheduleAttendee.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  bulkUpdate = async (scheduleId, items = []) => {
    await this.db.$transaction(async (db) => {
      for (const { id, ...data } of items)
        await db.scheduleAttendee.update({
          where: { id: id, schedule_id: scheduleId },
          data: data,
        });
    });
  };

  delete = async (id) => {
    const data = await this.db.scheduleAttendee.delete({ where: { id } });
    return data;
  };

  deleteMany = async (ids = []) => {
    const data = await this.db.scheduleAttendee.deleteMany({
      where: { id: { in: ids } },
    });
    return data;
  };

  isDone = async (id) => {
    const result = await this.findById(id);
    if (!result.schedule || !result.is_active) return false;

    const daysDifference = moment().diff(
      moment(result.schedule.end_date),
      "days"
    );
    return (
      daysDifference >= -1 &&
      (result.status == AttendeeStatus.PRESENT || result.status == null)
    );
  };
}

export default ScheduleAttendeeService;
