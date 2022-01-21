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
    <div class="q-mb-sm">
      <p class="text-weight-bold">Attestations de formation</p>
      <ni-banner v-if="!get(this.course, 'subProgram.program.learningGoals')">
        <template #message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger
          les attestations de fin de formation.
        </template>
      </ni-banner>
      <ni-bi-color-button icon="file_download" label="Attestations"
        :disable="disableDownloadCompletionCertificates" @click="downloadCompletionCertificates" size="16px" />
    </div>
    <div v-if="unsubscribedAttendances.length">
      <div class="text-italic q-ma-xs">
        Certains stagiaires inscrits à cette formation ont émargé dans d’autres formations du même programme
      </div>
      <ni-expanding-table :data="unsubscribedAttendances" :columns="columns" :pagination="pagination"
        :hide-bottom="false" :loading="loading">
        <template #expanding-row="{ props }">
          <q-td colspan="100%">
            <div v-for="attendance in props.row.attendances" :key="attendance._id" :props="props"
              class="q-ma-sm expanding-table-expanded-row">
              <div class="dates">{{ formatDate(attendance.slot.startDate) }}</div>
              <div class="hours">{{ formatSlotHour(attendance.slot) }} ({{ attendance.duration }})</div>
              <div class="misc">{{ attendance.misc }}</div>
              <div class="trainer">{{ attendance.trainer }}</div>
            </div>
          </q-td>
        </template>
      </ni-expanding-table>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import Attendances from '@api/Attendances';
import { NotifyNegative } from '@components/popup/notify';
import AttendanceTable from '@components/table/AttendanceTable';
import ExpandingTable from '@components/table/ExpandingTable';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import QuestionnaireAnswersCell from '@components/courses/QuestionnaireAnswersCell';
import BiColorButton from '@components/BiColorButton';
import Banner from '@components/Banner';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, E_LEARNING } from '@data/constants';
import { upperCaseFirstLetter, formatDuration, formatIdentity } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import moment from '@helpers/moment';
import { downloadZip } from '@helpers/file';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileTraineeFollowUp',
  mixins: [traineeFollowUpTableMixin, courseMixin],
  components: {
    'elearning-follow-up-table': ElearningFollowUpTable,
    'attendance-table': AttendanceTable,
    'ni-expanding-table': ExpandingTable,
    'questionnaire-answers-cell': QuestionnaireAnswersCell,
    'ni-bi-color-button': BiColorButton,
    'ni-banner': Banner,
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
      unsubscribedAttendances: [],
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'trainee',
          format: value => formatIdentity(value.identity, 'FL'),
          align: 'left',
        },
        { name: 'unexpectedAttendances', label: 'Emargements imprévus', field: 'attendancesCount', align: 'center' },
        { name: 'duration', label: 'Durée', field: 'totalDuration', align: 'center' },
        { name: 'expand', label: '', field: '' },
      ],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
    };
  },
  async created () {
    const promises = [this.getLearnersList(), this.getUnsubscribedAttendances()];
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
    disableDownloadCompletionCertificates () {
      return this.disableDocDownload || !get(this.course, 'subProgram.program.learningGoals');
    },
  },
  methods: {
    get,
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
    getTotalDuration (slots) {
      const total = slots.reduce(
        (acc, slot) => acc.add(moment.duration(moment(slot.endDate).diff(slot.startDate))),
        moment.duration()
      );

      return formatDuration(total);
    },
    getSlotDuration (slot) {
      const duration = moment.duration(moment(slot.endDate).diff(slot.startDate));

      return formatDuration(duration);
    },
    formatSlotHour (slot) {
      return `${moment(slot.startDate).format('HH:mm')} - ${moment(slot.endDate).format('HH:mm')}`;
    },
    async getUnsubscribedAttendances () {
      try {
        const query = {
          course: this.course._id,
          ...(this.isClientInterface && { company: this.loggedUser.company._id }),
        };
        const unsubscribedAttendancesGroupedByTrainees = await Attendances.listUnsubscribed(query);
        const formattedUnsubscribedAttendances = Object.keys(unsubscribedAttendancesGroupedByTrainees)
          .map(traineeId => ({
            _id: unsubscribedAttendancesGroupedByTrainees[traineeId][0].trainee._id,
            trainee: unsubscribedAttendancesGroupedByTrainees[traineeId][0].trainee,
            attendances: unsubscribedAttendancesGroupedByTrainees[traineeId].map(a => ({
              _id: a._id,
              duration: this.getSlotDuration(a.courseSlot),
              slot: { startDate: a.courseSlot.startDate, endDate: a.courseSlot.endDate },
              trainer: formatIdentity(get(a, 'trainer.identity'), 'FL'),
              misc: a.misc,
            })),
          }));
        this.unsubscribedAttendances = formattedUnsubscribedAttendances.map(attendance => ({
          ...attendance,
          attendancesCount: attendance.attendances.length,
          totalDuration: this.getTotalDuration(attendance.attendances.map(a => a.slot)),
        }));
      } catch (e) {
        console.error(e);
        this.unsubscribedAttendances = [];
        NotifyNegative('Erreur lors de la récupération des émargements annexes.');
      }
    },
    formatDate,
    async downloadCompletionCertificates () {
      if (this.disableDownloadCompletionCertificates) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadCompletionCertificates(this.course._id);
        downloadZip(pdf, 'attestations.zip');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement des attestations.');
      } finally {
        this.pdfLoading = false;
      }
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

.dates
  width: 10%

.hours
  width: 15%

.trainer
  width: 50%

.misc
  width: 15%

.expanding-table-expanded-row
  justify-content: flex-start
  div
    justify-content: center
    display: flex
    align-items: center
    justify-content: flex-start
    margin-right: 2%
    word-break: break-word
</style>
