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
                  <ni-button icon="delete" color="primary" @click="validateAttendanceSheetDeletion(props.row)" />
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
    <profile-follow-up :profile-id="profileId" class="q-my-md" />
    <div v-if="questionnaireActivities.length" class="q-my-xl">
      <p class="text-weight-bold">Réponses aux questionnaires</p>
      <div class="flex row">
        <q-card v-for="activity in questionnaireActivities" :key="activity._id" class="q-ma-sm card">
          <div class="q-pl-sm q-pt-sm text-grey-800 ellipsis-2-lines">
            Étape {{ activity.stepIndex + 1 }} - {{ upperCaseFirstLetter(activity.stepName) }}
          </div>
          <div class="q-pl-sm ellipsis-2-lines">{{ upperCaseFirstLetter(activity.name) }}</div>
          <div class="absolute-bottom q-mb-sm">
            <q-separator spaced />
            <div class="q-ml-sm q-pa-xs text-center text-grey-800 bg-grey-100 answers">
              {{ formatQuantity('réponse', new Set(activity.activityHistories.map(aH => aH.user._id)).size) }}
            </div>
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
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, INTRA, QUESTIONNAIRE } from '@data/constants';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheets from '@api/AttendanceSheets';
import Button from '@components/Button';
import ProfileFollowUp from 'src/modules/vendor/components/courses/ProfileFollowUp';
import { upperCaseFirstLetter, formatQuantity } from '@helpers/utils';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
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
      upperCaseFirstLetter,
      formatQuantity,
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
    await this.refreshAttendanceSheets();
  },
  computed: {
    ...mapState('course', ['course']),
    visibleColumns () {
      return this.course.type === INTRA ? ['date', 'actions'] : ['trainee', 'actions'];
    },
    questionnaireActivities () {
      return this.course.subProgram.steps.map((step, stepIndex) => step.activities
        .filter(activity => activity.type === QUESTIONNAIRE)
        .map(activity => ({ ...activity, stepIndex, stepName: step.name })))
        .flat();
    },
  },
  methods: {
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
    validateAttendanceSheetDeletion (attendanceSheet) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette feuille d\'émargement ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteAttendanceSheet(attendanceSheet._id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteAttendanceSheet (attendanceSheetId) {
      try {
        this.$q.loading.show();
        await AttendanceSheets.delete(attendanceSheetId);

        NotifyPositive('Feuille d\'émargement supprimée.');
        await this.refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppresion de la feuille d\'émargement.');
      } finally {
        this.$q.loading.hide();
      }
    },
  },
};
</script>
<style lang="stylus" scoped>
.answers
  border-radius: 10px !important
  width: 100px
.card
  height: 160px
  width: 200px
  @media screen and (max-width: 767px)
    width: 100%
</style>
