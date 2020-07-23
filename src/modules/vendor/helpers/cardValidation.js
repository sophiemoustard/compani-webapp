import Joi from 'joi';
import { TRANSITION } from '@data/constants';

const cardSchema = (card) => {
  switch (card.template) {
    case TRANSITION:
      return Joi.object().keys({
        title: Joi.string().required(),
      });
    default:
      return Joi.object().keys();
  }
};

export const cardValidation = (card, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(card, cardSchema(card), options);
};
