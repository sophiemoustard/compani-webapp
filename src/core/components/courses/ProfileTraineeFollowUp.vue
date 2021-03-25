<template>
  <div>
    <div class="q-my-md">
      <p class="text-weight-bold">Émargements</p>
      <attendance-table :course="course" />
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
                  <ni-button v-if="canUpdate" icon="delete" color="primary"
                    @click="validateAttendanceSheetDeletion(props.row)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <div class="flex justify-end">
        <ni-button v-if="canUpdate" class="bg-primary" color="white" icon="add"
          label="Ajouter une feuille d'émargement" @click="attendanceSheetAdditionModal = true" />
      </div>
    </div>
    <trainee-follow-up-table :learners="learners" :loading="loading" class="q-my-md" is-blended />

    <attendance-sheet-addition-modal v-model="attendanceSheetAdditionModal" @hide="resetAttendanceSheetAdditionModal"
      @submit="addAttendanceSheet" :new-attendance-sheet.sync="newAttendanceSheet" :validations="$v.newAttendanceSheet"
      :loading="modalLoading" :course="course" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import pick from 'lodash/pick';
import get from 'lodash/get';
import { required, requiredIf } from 'vuelidate/lib/validators';
import AttendanceSheets from '@api/AttendanceSheets';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceTable from '@components/table/AttendanceTable';
import Button from '@components/Button';
import TraineeFollowUpTable from '@components/courses/TraineeFollowUpTable';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, INTRA } from '@data/constants';
import { upperCaseFirstLetter, formatQuantity, formatIdentity } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { defineAbilitiesFor } from '@helpers/ability';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';

export default {
  name: 'ProfileTraineeFollowUp',
  mixins: [traineeFollowUpTableMixin],
  components: {
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
    'attendance-sheet-addition-modal': AttendanceSheetAdditionModal,
    'trainee-follow-up-table': TraineeFollowUpTable,
    'attendance-table': AttendanceTable,
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
        { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
        {
          name: 'trainee',
          label: 'Nom de l\'apprenant',
          align: 'left',
          field: row => (this.course.trainees.find(trainee => trainee._id === row.trainee)),
          format: value => formatIdentity(get(value, 'identity'), 'FL'),
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
    await this.getLearnersList();
    await this.refreshAttendanceSheets();
  },
  computed: {
    ...mapState({ course: state => state.course.course, loggedUser: state => state.main.loggedUser }),
    visibleColumns () {
      return this.course.type === INTRA ? ['date', 'actions'] : ['trainee', 'actions'];
    },
    canUpdate () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company', '_id', 'sector']));

      return ability.can('update', 'course_trainee_follow_up');
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
        if (!this.canUpdate) return NotifyNegative('Impossible d\'ajouter une feuille d\'emargement.');

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
      if (!this.canUpdate) return NotifyNegative('Impossible de supprimer la feuille d\'emargement.');

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

</style>
