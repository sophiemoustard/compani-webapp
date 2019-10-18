import Joi from 'joi';
import _ from 'lodash';

import { getCustomerLastMandateOrQuote } from './getCustomerLastMandateOrQuote';

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
  options.allowUnknown = true;
  const profileCopy = _.cloneDeep(profile);
  if (profileCopy.payment) {
    profileCopy.payment.mandates = getCustomerLastMandateOrQuote(profile.payment.mandates);
  }
  if (profileCopy.quotes && !profileCopy.subscriptionsAccepted) {
    profileCopy.quotes = getCustomerLastMandateOrQuote(profileCopy.quotes);
  } else {
    profileCopy.quotes = [];
  }
  return Joi.validate(profileCopy, customerProfileSchema, options);
};
