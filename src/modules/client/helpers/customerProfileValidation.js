import Joi from 'joi';
import cloneDeep from 'lodash/cloneDeep';

import { getLastDocument } from '@helpers/utils';

const customerProfileSchema = Joi.object().keys({
  identity: {
    lastname: Joi.string().required(),
  },
  contact: {
    primaryAddress: {
      fullAddress: Joi.string().required(),
    },
  },
  payment: {
    iban: Joi.string().required(),
    bic: Joi.string().required(),
    mandates: Joi.array().items(Joi.object().keys({
      signedAt: Joi.date().required(),
    })),
  },
  subscriptions: Joi.array().min(1).required(),
  subscriptionsAccepted: Joi.boolean().when('quotes', { is: Joi.array().length(0), then: Joi.valid(true) }),
  quotes: Joi.array().items(Joi.object({
    drive: Joi.object().keys({
      id: Joi.string(),
      link: Joi.string(),
    }).when('quotes', { is: Joi.array().min(1), then: Joi.required() }),
  })),
});

export const customerProfileValidation = (profile, options = {}) => {
  const profileCopy = cloneDeep(profile);
  if (profileCopy.payment) profileCopy.payment.mandates = getLastDocument(profile.payment.mandates);

  if (profileCopy.quotes && !profileCopy.subscriptionsAccepted) {
    profileCopy.quotes = getLastDocument(profileCopy.quotes);
  } else profileCopy.quotes = [];

  return customerProfileSchema.validate(profileCopy, { ...options, allowUnknown: true });
};
