import Joi from 'joi';

const userProfileSchema = Joi.object().keys({
  identity: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
  }),
  contact: Joi.object().keys({
    phone: Joi.string(),
  }),
  local: {
    email: Joi.string().required(),
  },
  picture: {
    link: Joi.string().required(),
  },
});

export const userProfileValidation = (profile, options = {}) => userProfileSchema.validate(
  profile,
  { ...options, allowUnknown: true }
);
