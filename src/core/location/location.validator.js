import Joi from "joi";

export const LocationValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    address: Joi.string().max(50).optional(),
    note: Joi.string().max(50).optional(),
    longitude: Joi.string().max(50).optional(),
    latitude: Joi.string().max(50).optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    address: Joi.string().max(50).optional(),
    note: Joi.string().max(50).optional(),
    longitude: Joi.string().max(50).optional(),
    latitude: Joi.string().max(50).optional(),
  }),
};

export default LocationValidator;
