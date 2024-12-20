import Joi from "joi";

export const ServiceRecommendationValidator = {
  create: Joi.object({
    title: Joi.string().optional(),
    doctor_id: Joi.string().optional(),
    client_id: Joi.string().required(),
    booking_id: Joi.string().required(),
    service_recommendation_items: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().integer().required(),
          note: Joi.string().required(),
          service_id: Joi.string().required(),
        })
      )
      .required(),
  }),
  update: Joi.object({
    title: Joi.string().optional(),
    doctor_id: Joi.string().optional(),
    client_id: Joi.string().optional(),
    booking_id: Joi.string().required(),
    service_recommendation_items: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().integer().required(),
          note: Joi.string().required(),
          service_id: Joi.string().required(),
        })
      )
      .optional(),
  }),
};

export default ServiceRecommendationValidator;
