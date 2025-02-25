import Joi from "joi";

export const ApiKeyStatus = {
  ACTIVE: "active",
  REVOKED: "revoked",
};

export const ApiKeyValidator = {
  create: Joi.object({
    status: Joi.string()
      .valid(...Object.values(ApiKeyStatus))
      .default(ApiKeyStatus.ACTIVE),
  }),
  update: Joi.object({
    status: Joi.string()
      .valid(...Object.values(ApiKeyStatus))
      .default(ApiKeyStatus.ACTIVE),
  }),
};

export default ApiKeyValidator;
