import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class RescheduleRequestService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.rescheduleRequest.findMany({
      ...q,
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.rescheduleRequest.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.rescheduleRequest.findUnique({
      where: { id },
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.rescheduleRequest.create({
      data: payload,
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });
    return data;
  };

  checkIsLocked = async (data) => {
    const schedule = await this.db.schedule.findUnique({
      where: { id: data.schedule_id },
    });

    if (schedule.is_locked) return true;

    return false;
  };

  isApproved = async (id) => {
    const rescheduleRequest = await this.db.rescheduleRequest.findUnique({
      where: { id },
    });

    if (rescheduleRequest.is_approved) return true;

    return false;
  };

  update = async (id, payload) => {
    const data = await this.db.rescheduleRequest.update({
      where: { id },
      data: payload,
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.rescheduleRequest.delete({ where: { id } });
    return data;
  };

  deleteByUser = async (userId, id) => {
    const data = await this.db.rescheduleRequest.delete({
      where: {
        id,
        user_id: userId,
      },
    });
    return data;
  };

  findAllByUser = async (userId, query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.rescheduleRequest.findMany({
      ...q,
      where: {
        ...q.where,
        user_id: userId,
      },
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.rescheduleRequest.count({
        where: {
          ...q.where,
          user_id: userId,
        },
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  approveReschedule = async (id) => {
    const data = await this.db.rescheduleRequest.update({
      where: { id },
      data: { is_approved: true },
      include: {
        schedule: true,
        user: true,
        new_schedule: true,
      },
    });
    return data;
  };
}

export default RescheduleRequestService;
