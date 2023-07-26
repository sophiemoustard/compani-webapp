import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER } from '@data/constants';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';

export const questionnaireAnswersMixin = {
  methods: {
    getChartComponent (template) {
      switch (template) {
        case SURVEY:
          return SurveyChart;
        case OPEN_QUESTION:
          return OpenQuestionChart;
        case QUESTION_ANSWER:
          return QuestionAnswerChart;
      }
    },
  },
};
