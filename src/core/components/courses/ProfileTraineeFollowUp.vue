<template>
  <div>
    <div class="q-my-md">
      <p class="text-weight-bold">Émargements</p>
      <ni-simple-table :data="attendanceSheets" :columns="columns" :loading="tableLoading"
        :visible-columns="visibleColumns" :pagination.sync="pagination">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions justify-end">
                  <ni-button icon="file_download" color="primary" type="a" target="_blank"
                    :href="props.row.file.link" />
                  <ni-button icon="delete" color="primary" disabled />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <div class="flex justify-end">
        <ni-button class="bg-primary" color="white" icon="add" label="Ajouter une feuille d'émargement"
          @click="attendanceSheetAdditionModal = true" />
      </div>
    </div>
    <profile-follow-up :profile-id="profileId" title="Progression des Participants" class="q-my-md" />
    <div v-if="followUp.subProgram" class="q-my-xl">
      <p class="text-weight-bold">Réponse aux questionnaires</p>
      <div v-for="(step, stepIndex) of followUp.subProgram.steps" :key="stepIndex" class="q-mb-xl">
        <div class="q-mb-sm">{{ stepIndex + 1 }} - {{ step.name }}</div>
        <q-card v-for="(activity, activityIndex) of step.activities" :key="activityIndex" flat class="q-mb-sm">
          <q-card-section class="cursor-pointer" @click="showCards(activity._id)">
            <div class="text-weight-bold">{{ activityIndex + 1 }} - {{ activity.name }}</div>
          </q-card-section>
          <div class="bg-peach-200 chart-container" v-if="areCardsDisplayed[activity._id]">
            <template v-for="(card, cardIndex) of activity.followUp">
              <survey-chart v-if="card.template === SURVEY" :key="cardIndex" class="chart" :card="card" />
              <open-question-chart v-if="card.template === OPEN_QUESTION" :key="cardIndex" class="chart" :card="card" />
              <question-answer-chart v-if="card.template === QUESTION_ANSWER" :key="cardIndex" class="chart"
                :card="card" />
            </template>
          </div>
        </q-card>
      </div>
    </div>

    <attendance-sheet-addition-modal v-model="attendanceSheetAdditionModal" @hide="resetAttendanceSheetAdditionModal"
      @submit="addAttendanceSheet" :new-attendance-sheet.sync="newAttendanceSheet" :validations="$v.newAttendanceSheet"
      :loading="modalLoading" :course="course" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required, requiredIf } from 'vuelidate/lib/validators';
import moment from '@helpers/moment';
import Courses from '@api/Courses';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, INTRA } from '@data/constants';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheets from '@api/AttendanceSheets';
import Button from '@components/Button';
import ProfileFollowUp from 'src/modules/vendor/components/courses/ProfileFollowUp';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'survey-chart': SurveyChart,
    'open-question-chart': OpenQuestionChart,
    'question-answer-chart': QuestionAnswerChart,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
    'attendance-sheet-addition-modal': AttendanceSheetAdditionModal,
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      followUp: {},
      areCardsDisplayed: {},
      tableLoading: false,
      modalLoading: false,
      attendanceSheetAdditionModal: false,
      attendanceSheets: [],
      newAttendanceSheet: { course: this.profileId },
      SURVEY,
      OPEN_QUESTION,
      QUESTION_ANSWER,
      columns: [
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => (value ? moment(value).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'trainee',
          label: 'Nom de l\'apprenant',
          align: 'left',
          field: row => (this.course.trainees.find(trainee => trainee._id === row.trainee)),
          format: value => (value ? `${value.identity.firstname} ${value.identity.lastname}` : ''),
        },
        { name: 'actions', label: '', align: 'left', field: row => row },
      ],
      pagination: {
        page: 1,
        rowsPerPage: 15,
      },
    };
  },
  validations () {
    return {
      newAttendanceSheet: {
        file: { required },
        trainee: { required: requiredIf(() => this.course.type !== INTRA) },
        date: { required: requiredIf(() => this.course.type === INTRA) },
      },
    };
  },
  async created () {
    await this.refreshFollowUp();
    await this.refreshAttendanceSheets();
  },
  computed: {
    ...mapState('course', ['course']),
    visibleColumns () {
      return this.course.type === INTRA ? ['date', 'actions'] : ['trainee', 'actions'];
    },
  },
  methods: {
    async refreshFollowUp () {
      try {
        this.followUp = await Courses.getFollowUp(this.profileId);
      } catch (e) {
        this.followUp = {};
        NotifyNegative('Erreur lors de la récupération du suivi des stagiaires.');
        console.error(e);
      }
    },
    async refreshAttendanceSheets () {
      try {
        this.tableLoading = true;
        this.attendanceSheets = await AttendanceSheets.list({ course: this.profileId });
      } catch (e) {
        console.error(e);
        this.attendanceSheets = [];
        NotifyNegative('Erreur lors de la récupération des feuilles d\'émargement.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetAttendanceSheetAdditionModal () {
      this.$v.newAttendanceSheet.$reset();
      this.newAttendanceSheet = { course: this.profileId };
    },
    showCards (activityId) {
      this.$set(this.areCardsDisplayed, activityId, !this.areCardsDisplayed[activityId]);
    },
    formatPayload () {
      const { course, file, trainee, date } = this.newAttendanceSheet;
      const form = new FormData();
      this.course.type === INTRA ? form.append('date', date) : form.append('trainee', trainee);
      form.append('course', course);
      form.append('file', file);

      return form;
    },
    async addAttendanceSheet () {
      try {
        this.$v.newAttendanceSheet.$touch();
        if (this.$v.newAttendanceSheet.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.modalLoading = true;

        await AttendanceSheets.create(this.formatPayload());

        this.attendanceSheetAdditionModal = false;
        NotifyPositive('Feuille d\'émargement ajoutée.');
        await this.refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la feuille d\'émargement.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.chart-container
  display: flex
  flex-direction: column

.chart
  margin: 8px 8px 8px 48px
</style>
