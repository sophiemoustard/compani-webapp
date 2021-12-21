<template>
  <div>
    <div class="q-mt-lg q-mb-xl">
      <p class="text-weight-bold">Émargements</p>
      <attendance-table :course="course" />
    </div>
    <div v-if="areQuestionnaireAnswersVisible" class="q-mb-xl">
      <p class="text-weight-bold">Réponses aux questionnaires</p>
      <div class="questionnaires-container">
        <questionnaire-answers-cell v-for="questionnaire in questionnaires" :key="questionnaire._id"
          :questionnaire="questionnaire" @click="goToQuestionnaireAnswers(questionnaire._id)" />
      </div>
    </div>
    <elearning-follow-up-table v-if="courseHasElearningStep" :learners="learners" :loading="loading" class="q-mb-xl"
      is-blended />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import AttendanceTable from '@components/table/AttendanceTable';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import QuestionnaireAnswersCell from '@components/courses/QuestionnaireAnswersCell';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, E_LEARNING } from '@data/constants';
import { upperCaseFirstLetter } from '@helpers/utils';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';

export default {
  name: 'ProfileTraineeFollowUp',
  mixins: [traineeFollowUpTableMixin],
  components: {
    'elearning-follow-up-table': ElearningFollowUpTable,
    'attendance-table': AttendanceTable,
    'questionnaire-answers-cell': QuestionnaireAnswersCell,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      modalLoading: false,
      SURVEY,
      OPEN_QUESTION,
      QUESTION_ANSWER,
      upperCaseFirstLetter,
      questionnaires: [],
    };
  },
  async created () {
    const promises = [this.getLearnersList()];
    if (!this.isClientInterface) promises.push(this.refreshQuestionnaires());

    await Promise.all(promises);
  },
  computed: {
    ...mapState({ course: state => state.course.course, loggedUser: state => state.main.loggedUser }),
    areQuestionnaireAnswersVisible () {
      return !this.isClientInterface && this.questionnaires.length;
    },
    courseHasElearningStep () {
      return this.course.subProgram.steps.some(step => step.type === E_LEARNING);
    },
  },
  methods: {
    async refreshQuestionnaires () {
      try {
        this.questionnaires = await Courses.getCourseQuestionnaires(this.course._id);
      } catch (e) {
        console.error(e);
        this.questionnaires = [];
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
      }
    },
    goToQuestionnaireAnswers (questionnaireId) {
      return this.$router.push(
        { name: 'ni management questionnaire answers', params: { courseId: this.course._id, questionnaireId } }
      );
    },
  },
};
</script>
<style lang="sass" scoped>
  .questionnaires-container
    display: grid
    grid-auto-flow: row
    grid-auto-rows: 1fr
    grid-template-columns: repeat(auto-fill, 224px)
    grid-gap: 16px
</style>
