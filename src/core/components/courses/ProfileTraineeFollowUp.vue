<template>
  <div>
    <div class="q-my-md">
      <p class="text-weight-bold">Émargements</p>
      <ni-simple-table :data="attendanceSheets" :columns="columns">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions justify-end">
                  <ni-button icon="download" color="primary" type="a" :href="props.row.link" />
                  <ni-button icon="delete" color="primary" disabled />
                </div>
              </template>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <div class="flex justify-end">
        <ni-button class="bg-primary" color="white" icon="add" label="Ajouter une feuille d'émargement"
          @click="addAttendanceSheet()" />
      </div>
    </div>
    <div v-if="followUp.subProgram">
      <p class="text-weight-bold">Progression des participants</p>
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from '@helpers/moment';
import Courses from '@api/Courses';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, INTRA } from '@data/constants';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheets from '@api/AttendanceSheets';
import Button from '@components/Button';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'survey-chart': SurveyChart,
    'open-question-chart': OpenQuestionChart,
    'question-answer-chart': QuestionAnswerChart,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      followUp: {},
      areCardsDisplayed: {},
      attendanceSheetsLoading: false,
      attendanceSheets: [],
      SURVEY,
      OPEN_QUESTION,
      QUESTION_ANSWER,
    };
  },
  async created () {
    await this.refreshFollowUp();
    await this.refreshAttendanceSheets();
  },
  computed: {
    ...mapState('course', ['course']),
    columns () {
      return this.course.type === INTRA
        ? [
          {
            name: 'date',
            label: 'Date',
            align: 'left',
            field: 'date',
            format: value => (value ? moment(value).format('DD/MM/YYYY') : ''),
          },
          { name: 'actions', label: '', align: 'left', field: row => row },
        ]
        : [
          {
            name: 'trainee',
            label: 'Nom de l\'apprenant',
            align: 'left',
            field: row => (this.course.trainees.find(trainee => trainee._id === row.trainee)),
            format: value => (value ? `${value.identity.firstname} ${value.identity.lastname}` : ''),
          },
          { name: 'actions', label: '', align: 'left', field: row => row },
        ];
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
        this.attendanceSheetsLoading = true;
        this.attendanceSheets = await AttendanceSheets.list({ course: this.profileId });
      } catch (e) {
        console.error(e);
        this.attendanceSheets = [];
        NotifyNegative('Erreur lors de la récupération des feuilles d\'émargement.');
      } finally {
        this.attendanceSheetsLoading = false;
      }
    },
    showCards (activityId) {
      this.$set(this.areCardsDisplayed, activityId, !this.areCardsDisplayed[activityId]);
    },
    async addAttendanceSheet () {
      try {
        await AttendanceSheets.create({
          course: this.profileId,
          link: 'https://www.google.com',
          trainee: this.course.trainees[0]._id,
          date: moment(),
        });

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
