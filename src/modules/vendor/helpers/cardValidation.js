import Joi from 'joi';
import {
  TRANSITION,
  TITLE_TEXT_MEDIA,
  TITLE_TEXT,
  TEXT_MEDIA,
  FLASHCARD,
  FILL_THE_GAPS,
  ORDER_THE_SEQUENCE,
  SINGLE_CHOICE_QUESTION,
  SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT,
  FILL_THE_GAPS_MAX_ANSWERS_COUNT,
  MULTIPLE_CHOICE_QUESTION,
  MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT,
  SURVEY,
  SURVEY_LABEL_MAX_LENGTH,
  OPEN_QUESTION,
  QUESTION_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH,
} from '@data/constants';

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
        }).required(),
      });
    case TITLE_TEXT:
      return Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().required(),
      });
    case TEXT_MEDIA:
      return Joi.object().keys({
        text: Joi.string().required(),
        media: Joi.object().keys({
          publicId: Joi.string().required(),
          link: Joi.string().required(),
        }).required(),
      });
    case FLASHCARD:
      return Joi.object().keys({
        text: Joi.string().required(),
        backText: Joi.string().required(),
      });
    case FILL_THE_GAPS:
      return Joi.object().keys({
        gappedText: Joi.string().required(),
        answers: Joi.array().items(
          Joi.object({ label: Joi.string().required() })
        ).min(2).max(FILL_THE_GAPS_MAX_ANSWERS_COUNT),
        explanation: Joi.string().required(),
      });
    case SINGLE_CHOICE_QUESTION:
      return Joi.object().keys({
        question: Joi.string().required().max(QUESTION_MAX_LENGTH),
        qcuGoodAnswer: Joi.string().required(),
        falsyAnswers: Joi.array().items(
          Joi.string().max(QC_ANSWER_MAX_LENGTH)
        ).min(1).max(SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT),
        explanation: Joi.string().required(),
      });
    case ORDER_THE_SEQUENCE:
      return Joi.object().keys({
        question: Joi.string().required().max(QUESTION_MAX_LENGTH),
        orderedAnswers: Joi.array().items(Joi.string()).min(2).max(3),
        explanation: Joi.string().required(),
      });
    case MULTIPLE_CHOICE_QUESTION:
      return Joi.object().keys({
        question: Joi.string().required().max(QUESTION_MAX_LENGTH),
        qcmAnswers: Joi.array()
          .items(Joi.object({
            label: Joi.string().required().max(QC_ANSWER_MAX_LENGTH),
            correct: Joi.boolean().required(),
          }))
          .has(Joi.object({ correct: true }))
          .min(2)
          .max(MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT),
        explanation: Joi.string().required(),
      });
    case SURVEY:
      return Joi.object().keys({
        question: Joi.string().required().max(QUESTION_MAX_LENGTH),
        label: Joi.alternatives().try(
          Joi.object().keys({
            left: Joi.string().valid('', null),
            right: Joi.string().valid('', null),
          }),
          Joi.object().keys({
            left: Joi.string().required().max(SURVEY_LABEL_MAX_LENGTH),
            right: Joi.string().required().max(SURVEY_LABEL_MAX_LENGTH),
          })
        ),
      });
    case OPEN_QUESTION:
      return Joi.object().keys({
        question: Joi.string().required().max(QUESTION_MAX_LENGTH),
      });
    default:
      return Joi.object().keys();
  }
};

export const cardValidation = (card, options = {}) => cardSchema(card)
  .validate(card, { ...options, allowUnknown: true });
