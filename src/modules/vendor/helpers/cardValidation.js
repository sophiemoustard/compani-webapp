import Joi from 'joi';
import { TRANSITION, TITLE_TEXT_MEDIA } from '@data/constants';

const cardSchema = (card) => {
  switch (card.template) {
    case TRANSITION:
      return Joi.object().keys({
        title: Joi.string().required(),
      });
    case TITLE_TEXT_MEDIA:
      return Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().required(),
        media: Joi.object().keys({
          publicId: Joi.string().required(),
          link: Joi.string().required(),
        }),
      });
    default:
      return Joi.object().keys();
  }
};

export const cardValidation = (card, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(card, cardSchema(card), options);
};
