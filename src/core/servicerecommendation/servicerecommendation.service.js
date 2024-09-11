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
      include: {
        service_recommendation_items: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.serviceRecommendation.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.serviceRecommendation.findUnique({
      where: { id },
      include: {
        service_recommendation_items: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const { service_recommendation_items, ...recommendationData } = payload;
    const data = await this.db.serviceRecommendation.create({
      data: {
        ...recommendationData,
        service_recommendation_items: {
          create: service_recommendation_items,
        },
      },
      include: {
        service_recommendation_items: true,
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const { service_recommendation_items, ...recommendationData } = payload;
    const data = await this.db.serviceRecommendation.update({
      where: { id },
      data: {
        ...recommendationData,
        service_recommendation_items: {
          deleteMany: {},
          create: service_recommendation_items,
        },
      },
      include: {
        service_recommendation_items: true,
      },
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.serviceRecommendation.delete({
      where: { id },
      include: {
        service_recommendation_items: true,
      },
    });
    return data;
  };
}

export default ServiceRecommendationService;
