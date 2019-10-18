import Joi from 'joi';

const userProfileSchema = Joi.object().keys({
  identity: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    nationality: Joi.string().required(),
    birthDate: Joi.string().required(),
    birthCountry: Joi.string().required(),
    birthState: Joi.string().required(),
    birthCity: Joi.string().required(),
    socialSecurityNumber: Joi.number().required(),
  }),
  contact: Joi.object().keys({
    phone: Joi.string(),
    address: Joi.object().keys({
      fullAddress: Joi.string().required(),
      street: Joi.string(),
      zipCode: Joi.string(),
      city: Joi.string(),
    }),
  }),
  local: {
    email: Joi.string().required(),
  },
  picture: {
    link: Joi.string().required(),
  },
  administrative: Joi.object().keys({
    driveFolder: Joi.object().keys({
      driveId: Joi.string(),
    }),
    emergencyContact: Joi.object().keys({
      name: Joi.string().required(),
      phoneNumber: Joi.string().required(),
    }).required(),
    payment: {
      rib: {
        iban: Joi.string().required(),
        bic: Joi.string().required(),
      },
    },
    identityDocs: Joi.string().when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    mutualFund: Joi.object().keys({
      has: Joi.boolean().required(),
      driveId: Joi.string().allow(null).when('has', { is: true, then: Joi.required() }),
      link: Joi.string().allow(null),
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    navigoInvoice: {
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null),
    },
    transportInvoice: Joi.object().keys({
      transportType: Joi.string().required(),
      driveId: Joi.string().when('transportType', { is: 'public', then: Joi.required() }),
      link: Joi.string(),
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    phoneInvoice: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string(),
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    certificates: Joi.array(),
    healthAttest: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string(),
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    idCardRecto: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string(),
    }).when('identityDocs', {
      is: 'cni',
      then: Joi.object({
        driveId: Joi.required(),
        link: Joi.required(),
      }),
      otherwise: Joi.object({
        driveId: Joi.allow(null),
        link: Joi.allow(null),
      }),
    }),
    passport: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string(),
    }).when('identityDocs', {
      is: 'pp',
      then: Joi.object({
        driveId: Joi.required(),
        link: Joi.required(),
      }),
      otherwise: Joi.object({
        driveId: Joi.allow(null),
        link: Joi.allow(null),
      }),
    }),
    residencePermitRecto: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string(),
    }).when('identityDocs', {
      is: 'ts',
      then: Joi.object({
        driveId: Joi.required(),
        link: Joi.required(),
      }),
      otherwise: Joi.object({
        driveId: Joi.allow(null),
        link: Joi.allow(null),
      }),
    }),
  }),
});

export const userProfileValidation = (profile, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(profile, userProfileSchema, options);
};
