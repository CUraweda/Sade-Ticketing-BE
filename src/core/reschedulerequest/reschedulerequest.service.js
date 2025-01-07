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
      select: {
        id: true,
        response: true,
        is_approved: true,
        attendee: {
          select: {
            client: {
              select: {
                first_name: true,
                last_name: true,
                avatar: true,
                category: true,
              },
            },
            schedule: {
              select: {
                start_date: true,
                end_date: true,
              },
            },
          },
        },
        new_schedule: {
          select: {
            start_date: true,
            end_date: true,
          },
        },
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
        attendee: {
          select: {
            booking_id: true,
            client: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                avatar: true,
                category: true,
                dob: true,
              },
            },
            schedule: {
              select: {
                id: true,
                title: true,
                start_date: true,
                end_date: true,
                service_id: true,
              },
            },
          },
        },
        new_schedule: {
          select: {
            id: true,
            title: true,
            start_date: true,
            end_date: true,
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.rescheduleRequest.create({
      data: payload,
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.rescheduleRequest.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.rescheduleRequest.delete({ where: { id } });
    return data;
  };

  isApproved = async (id) => {
    const data = await this.db.rescheduleRequest.findUnique({
      where: { id },
      select: { is_approved: true },
    });
    return data.is_approved;
  };

  isCreator = async (id, userId) => {
    const data = await this.db.rescheduleRequest.count({
      where: { id, attendee: { client: { user_id: userId } } },
    });
    return data > 0;
  };
}

export default RescheduleRequestService;
