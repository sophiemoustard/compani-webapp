<template>
  <q-page class="vendor-background" padding>
    <profile-header :title="activity.name">
      <template #body>
        <div class="row profile-info q-pl-lg">
          <q-item class="col-md-6 col-xs-12">
            <q-item-section side><q-icon size="xs" name="library_books" /></q-item-section>
            <q-item-section>{{ activity.steps[0].name }}</q-item-section>
          </q-item>
          <q-item class="col-md-6 col-xs-12">
            <q-item-section side><q-icon size="xs" name="book" /></q-item-section>
            <q-item-section>{{ activity.steps[0].subProgram.program.name }}</q-item-section>
          </q-item>
        </div>
      </template>
    </profile-header>
    <div class="q-my-xl">
      <q-card v-for="(card, cardIndex) of activity.followUp" :key="cardIndex" flat class="q-mb-sm">
        <component :is="getChartComponent(card.template)" :card="card" />
      </q-card>
    </div>
  </q-page>
</template>

<script>
import Courses from '@api/Courses';
import ProfileHeader from '@components/ProfileHeader';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER } from '@data/constants';
import { NotifyNegative } from '@components/popup/notify';

export default {
  name: 'QuestionnaireAnswers',
  components: {
    'survey-chart': SurveyChart,
    'open-question-chart': OpenQuestionChart,
    'question-answer-chart': QuestionAnswerChart,
    'profile-header': ProfileHeader,
  },
  props: {
    courseId: { type: String, required: true },
    activityId: { type: String, required: true },
  },
  data () {
    return {
      activity: { steps: [{ subProgram: { program: {} } }] },
    };
  },
  async created () {
    await this.refreshAnswers();
  },
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
    async refreshAnswers () {
      try {
        this.activity = await Courses.getQuestionnaireAnswers(this.courseId, { activity: this.activityId });
      } catch (e) {
        this.$router.go(-1);
        NotifyNegative('Erreur lors de la récupération des réponses');
        console.error(e);
        this.activity = { steps: [{ subProgram: { program: {} } }] };
      }
    },
  },
};
</script>
