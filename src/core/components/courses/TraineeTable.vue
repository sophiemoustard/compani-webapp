<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">{{ tableTitle }}</p>
        <ni-copy-button class="q-mb-md" icon="content_copy" label="Copier les adresses e-mail"
          :value-to-copy="traineesEmails" @copy-success="handleCopySuccess" />
      </div>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" :pagination.sync="traineesPagination"
          :visible-columns="traineesVisibleColumns">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="edit" @click.native="openTraineeEditionModal(props.row)"
                      :disable="!!course.archivedAt" />
                    <ni-button icon="close" @click.native="validateTraineeDeletion(col.value)"
                      :disable="!!course.archivedAt" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right" v-if="canEdit">
          <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
            @click="openTraineeCreationModal" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Trainee addition modal -->
    <trainee-addition-modal v-model="traineeAdditionModal" :new-trainee.sync="newTrainee"
      :validations="$v.newTrainee" :loading="traineeModalLoading" @hide="resetTraineeAdditionForm" @submit="addTrainee"
      :trainees-options="traineesOptions" @open-learner-creation-modal="openLearnerCreationModal" />

    <!-- Trainee edition modal -->
    <trainee-edition-modal v-model="traineeEditionModal" :edited-trainee.sync="editedTrainee" @submit="updateTrainee"
      @hide="resetTraineeEditionForm" :loading="traineeModalLoading" :validations="$v.editedTrainee" />

    <learner-creation-modal v-model="learnerCreationModal" :new-user.sync="newLearner" @hide="resetLearnerCreationModal"
      :first-step="firstStep" @next-step="nextStepLearnerCreationModal" display-company
      :company-options="companyOptions" :disable-company="disableCompany"
      :validations="$v.newLearner" :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Courses from '@api/Courses';
import { INTER_B2B, TRAINER, INTRA, DEFAULT_AVATAR } from '@data/constants';
import {
  formatPhone,
  formatPhoneForPayload,
  formatIdentity,
  formatAndSortOptions,
  removeEmptyProps,
} from '@helpers/utils';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import TraineeAdditionModal from '@components/courses/TraineeAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import { learnerCreationMixin } from '@mixins/learnerCreationMixin';
import CopyButton from '@components/CopyButton';

export default {
  name: 'TraineeTable',
  mixins: [userMixin, courseMixin, learnerCreationMixin],
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'trainee-edition-modal': TraineeEditionModal,
    'trainee-addition-modal': TraineeAdditionModal,
    'ni-copy-button': CopyButton,
    'learner-creation-modal': LearnerCreationModal,
  },
  data () {
    return {
      traineesColumns: [
        {
          name: 'company',
          label: 'Structure',
          align: 'left',
          field: row => get(row, 'company.name') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => get(row, 'identity.firstname') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => get(row, 'identity.lastname') || '',
          classes: 'text-capitalize',
        },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '' },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone') || '',
          format: formatPhone,
        },
        { name: 'actions', label: '', align: 'left', field: '_id' },
      ],
      traineesPagination: { rowsPerPage: 0, sortBy: 'lastname' },
      potentialTrainees: [],
      traineeAdditionModal: false,
      newTrainee: '',
      traineeEditionModal: false,
      traineeModalLoading: false,
      editedTrainee: {
        identity: {},
        contact: {},
        local: {},
      },
      companyOptions: [],
      userAlreadyHasCompany: false,
    };
  },
  computed: {
    ...mapState('course', ['course']),
    ...mapGetters({ vendorRole: 'main/getVendorRole', company: 'main/getCompany' }),
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
    tableTitle () {
      return this.canEdit || this.isTrainer
        ? `Stagiaires (${this.traineesNumber})`
        : `Stagiaires de votre structure (${this.traineesNumber})`;
    },
    traineesVisibleColumns () {
      const visibleColumns = ['firstname', 'lastname', 'email', 'phone'];
      if (this.canEdit) visibleColumns.push('actions');

      return this.isIntraCourse ? visibleColumns : ['company', ...visibleColumns];
    },
    traineesEmails () {
      if (!this.course.trainees) return '';

      return this.course.trainees.map(trainee => trainee.local.email).reduce((acc, value) => `${acc},${value}`, '');
    },
    traineesOptions () {
      return this.potentialTrainees
        .map(pt => ({
          value: pt._id,
          label: formatIdentity(pt.identity, 'FL'),
          email: pt.local.email || '',
          picture: get(pt, 'picture.link') || DEFAULT_AVATAR,
          ...(!this.isIntraCourse && { company: get(pt, 'company.name') || '' }),
          additionalFilters: [pt.local.email],
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    disableCompany () {
      return this.course.type === INTRA || this.userAlreadyHasCompany;
    },
  },
  async created () {
    await this.getPotentialTrainees();
  },
  methods: {
    async getPotentialTrainees () {
      try {
        let query;

        if (this.course.type === INTRA) query = { company: get(this.course, 'company._id') };
        if (this.course.type === INTER_B2B) {
          query = this.isClientInterface ? { company: get(this.loggedUser, 'company._id') } : { hasCompany: true };
        }

        this.potentialTrainees = Object.freeze(await Users.learnerList(query));
      } catch (error) {
        this.potentialTrainees = [];
        console.error(error);
      }
    },
    resetTraineeAdditionForm () {
      this.newTrainee = '';
      this.$v.newTrainee.$reset();
    },
    async addTrainee () {
      try {
        this.traineeModalLoading = true;
        this.$v.newTrainee.$touch();
        if (this.$v.newTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.addTrainee(this.course._id, { trainee: this.newTrainee });
        this.traineeAdditionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire ajouté(e).');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la stagiaire.');
      } finally {
        this.traineeModalLoading = false;
      }
    },
    async openTraineeEditionModal (trainee) {
      this.editedTrainee = {
        ...this.editedTrainee,
        ...pick(trainee, ['_id', 'identity.firstname', 'identity.lastname', 'local.email', 'contact.phone']),
      };
      this.traineeEditionModal = true;
    },
    resetTraineeEditionForm () {
      this.$v.editedTrainee.$reset();
      this.editedTrainee = { identity: {}, local: {}, contact: {} };
    },
    async updateTrainee () {
      try {
        this.traineeModalLoading = true;
        this.$v.editedTrainee.$touch();
        if (this.$v.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (get(this.editedTrainee, 'contact.phone')) {
          this.editedTrainee.contact.phone = formatPhoneForPayload(this.editedTrainee.contact.phone);
        }

        await Users.updateById(this.editedTrainee._id, omit(this.editedTrainee, ['_id', 'local']));
        this.traineeEditionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire modifié(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du/de la stagiaire.');
      } finally {
        this.traineeModalLoading = false;
      }
    },
    validateTraineeDeletion (traineeId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer le/la stagiaire de la formation ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteTrainee(traineeId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteTrainee (traineeId) {
      try {
        await Courses.deleteTrainee(this.course._id, traineeId);
        this.$emit('refresh');
        NotifyPositive('Stagiaire supprimé(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du/de la stagiaire.');
      }
    },
    handleCopySuccess () {
      NotifyPositive('Adresses mail copiées !');
    },
    openTraineeCreationModal () {
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de stagiaire à une formation archivée.');
      }

      this.traineeAdditionModal = true;
    },
    async openLearnerCreationModal () {
      this.traineeAdditionModal = false;
      this.learnerCreationModal = true;
      await this.refreshCompanies();
    },
    async submitLearnerCreationModal () {
      this.$v.newLearner.$touch();
      if (this.$v.newLearner.$error) return NotifyWarning('Champ(s) invalide(s).');
      try {
        if (this.learnerAlreadyExists) {
          const payload = removeEmptyProps(omit(this.newLearner, '_id'));
          if (get(payload, 'contact.phone')) {
            payload.contact.phone = formatPhoneForPayload(this.newLearner.contact.phone);
          }
          await Users.updateById(this.newLearner._id, payload);
          NotifyPositive('Apprenant(e) modifié(e).');
        } else await this.createLearner();
        this.learnerCreationModal = false;
        this.traineeAdditionModal = true;
        this.newTrainee = this.newLearner._id;
        await this.getPotentialTrainees();
      } catch (error) {
        NotifyNegative('Erreur lors de l\'ajout de l\' apprenant(e).');
      }
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .table-title
    flex: 1

</style>
