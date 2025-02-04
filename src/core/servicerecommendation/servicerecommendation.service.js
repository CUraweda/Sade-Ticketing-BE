import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ServiceRecommendationService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.serviceRecommendation.findMany({
      ...q,
      select: {
        id: true,
        quantity: true,
        is_read: true,
        updated_at: true,
        weekly_frequency: true,
        doctor: { select: { avatar: true, first_name: true, last_name: true } },
        client: { select: { avatar: true, first_name: true, last_name: true } },
        service: { select: { title: true, price_unit: true, category: true } },
      },
    });

    if (query.paginate) {
      const countData = await this.db.serviceRecommendation.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.serviceRecommendation.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            first_name: true,
            last_name: true,
            avatar: true,
            category: true,
          },
        },
        bookings: {
          select: {
            id: true,
            title: true,
            service: { select: { id: true, title: true, category: true } },
          },
        },
        client: {
          select: {
            avatar: true,
            first_name: true,
            last_name: true,
            dob: true,
            category: true,
          },
        },
        service: {
          select: {
            title: true,
            category: true,
            price_unit: true,
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const { booking_id, ...rest } = payload;
    const data = await this.db.serviceRecommendation.create({
      data: {
        ...rest,
        bookings: {
          connect: { id: booking_id },
        },
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.serviceRecommendation.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.serviceRecommendation.delete({
      where: { id },
    });
    return data;
  };
}

export default ServiceRecommendationService;
