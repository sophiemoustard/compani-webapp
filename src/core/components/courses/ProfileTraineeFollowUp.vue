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
    <trainee-follow-up-table :learners="learners" :loading="loading" class="q-mb-xl" is-blended />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import AttendanceTable from '@components/table/AttendanceTable';
import TraineeFollowUpTable from '@components/courses/TraineeFollowUpTable';
import QuestionnaireAnswersCell from '@components/courses/QuestionnaireAnswersCell';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER } from '@data/constants';
import { upperCaseFirstLetter } from '@helpers/utils';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';

export default {
  name: 'ProfileTraineeFollowUp',
  mixins: [traineeFollowUpTableMixin],
  components: {
    'trainee-follow-up-table': TraineeFollowUpTable,
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
    this.getLearnersList();
    if (!this.isClientInterface) this.refreshQuestionnaires();
  },
  computed: {
    ...mapState({ course: state => state.course.course, loggedUser: state => state.main.loggedUser }),
    areQuestionnaireAnswersVisible () {
      return !this.isClientInterface && this.questionnaires.length;
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
<style lang="stylus" scoped>
  .questionnaires-container
    display: grid
    grid-auto-flow: row
    grid-auto-rows: 1fr
    grid-template-columns: repeat(auto-fill, 224px)
    grid-gap: 16px
</style>
