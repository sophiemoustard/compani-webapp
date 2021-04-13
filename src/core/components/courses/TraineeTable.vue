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
                    <ni-button icon="edit" @click.native="openTraineeEditionModal(props.row)" />
                    <ni-button icon="close" @click.native="validateTraineeDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right" v-if="canEdit">
          <ni-button color="primary" icon="add" label="Ajouter un stagiaire" :disable="loading"
            @click="traineeCreationModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add trainee modal -->
    <learner-creation-modal v-model="traineeCreationModal" :new-user.sync="newTrainee" :company-options="companyOptions"
      :first-step="firstStep" :identity-step="addNewTraineeIdentityStep" :company-step="!isIntraCourse"
      :validations="$v.newTrainee" :loading="traineeCreationModalLoading" @hide="resetAddTraineeForm"
      @submit="addTrainee" @next-step="nextStepTraineeCreationModal" />

    <!-- Trainee edition modal -->
    <trainee-edition-modal v-model="traineeEditionModal" :edited-trainee.sync="editedTrainee" @submit="updateTrainee"
      @hide="resetTraineeEditionForm" :loading="traineeEditionModalLoading" :validations="$v.editedTrainee" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Users from '@api/Users';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import { INTER_B2B, TRAINEE, TRAINER } from '@data/constants';
import { formatPhone, clear, formatPhoneForPayload, formatAndSortOptions } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import CopyButton from '@components/CopyButton';
import Email from '@api/Email';

export default {
  name: 'TraineeTable',
  mixins: [userMixin, courseMixin],
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'learner-creation-modal': LearnerCreationModal,
    'trainee-edition-modal': TraineeEditionModal,
    'ni-copy-button': CopyButton,
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
          format: value => formatPhone(value),
        },
        { name: 'actions', label: '', align: 'left', field: '_id' },
      ],
      traineesPagination: {
        rowsPerPage: 0,
        sortBy: 'lastname',
      },
      companyOptions: [],
      traineeCreationModal: false,
      traineeCreationModalLoading: false,
      firstStep: true,
      addNewTraineeIdentityStep: false,
      newTrainee: {
        identity: {
          firstname: '',
          lastname: '',
        },
        contact: { phone: '' },
        local: { email: '' },
        company: '',
      },
      traineeValidations: {
        identity: { lastname: { required: requiredIf(() => this.addNewTraineeIdentityStep) } },
        local: { email: { required, email } },
        contact: { phone: { required: requiredIf(() => this.addNewTraineeIdentityStep), frPhoneNumber } },
        company: { required: requiredIf(() => this.course.type === INTER_B2B) },
      },
      traineeEditionModal: false,
      traineeEditionModalLoading: false,
      editedTrainee: {
        identity: {},
        contact: {},
        local: {},
      },
    };
  },
  validations () {
    return {
      newTrainee: this.traineeValidations,
      editedTrainee: pick(this.traineeValidations, ['identity', 'contact']),
    };
  },
  computed: {
    ...mapState('course', ['course']),
    ...mapGetters({ vendorRole: 'main/getVendorRole' }),
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
    tableTitle () {
      return this.canEdit || this.isTrainer
        ? `Participants (${this.traineesNumber})`
        : `Participants de votre structure (${this.traineesNumber})`;
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
  },
  async created () {
    if (!this.isIntraCourse && this.canEdit) await this.refreshCompanies();
  },
  methods: {
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    resetAddTraineeForm () {
      this.firstStep = true;
      this.addNewTraineeIdentityStep = false;
      this.newTrainee = { ...clear(this.newTrainee) };
      this.$v.newTrainee.$reset();
    },
    async nextStepTraineeCreationModal () {
      try {
        this.$v.newTrainee.$touch();
        if (!this.newTrainee.local.email || this.$v.newTrainee.local.email.$error) {
          return NotifyWarning('Champ(s) invalide(s).');
        }

        this.traineeCreationModalLoading = true;
        const userInfo = await Users.exists({ email: this.newTrainee.local.email });

        if (userInfo.exists) {
          if (this.isIntraCourse) {
            if (!userInfo.user.company) {
              this.newTrainee.company = this.course.company._id;
              await this.addTrainee();
            } else if (userInfo.user.company === this.course.company._id) await this.addTrainee();
            else return NotifyNegative('Ce stagiaire n\'est pas relié à la structure de la formation.');
          } else if (userInfo.user.company) await this.addTrainee();
          else this.firstStep = false;
        } else {
          if (this.isIntraCourse) this.newTrainee.company = this.course.company._id;
          this.firstStep = false;
          this.addNewTraineeIdentityStep = true;
        }
        this.$v.newTrainee.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.traineeCreationModalLoading = false;
      }
    },
    formatAddTraineePayload () {
      const payload = cloneDeep(this.newTrainee);

      if (get(payload, 'identity.firstname') === '') {
        if (get(payload, 'identity.lastname') === '') delete payload.identity;
        else delete payload.identity.firstname;
      }

      if (get(payload, 'contact.phone') === '') delete payload.contact;
      else payload.contact.phone = formatPhoneForPayload(payload.contact.phone);

      if (get(payload, 'company') === '') delete payload.company;

      return payload;
    },
    async addTrainee () {
      try {
        if (!this.firstStep) {
          this.$v.newTrainee.$touch();
          if (this.$v.newTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        }

        this.traineeCreationModalLoading = true;
        const payload = this.formatAddTraineePayload();
        await Courses.addTrainee(this.course._id, payload);
        NotifyPositive('Stagiaire ajouté.');

        await this.sendWelcome();

        this.traineeCreationModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.traineeCreationModalLoading = false;
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
        this.traineeEditionModalLoading = true;
        this.$v.editedTrainee.$touch();
        if (this.$v.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (get(this.editedTrainee, 'contact.phone')) {
          this.editedTrainee.contact.phone = formatPhoneForPayload(this.editedTrainee.contact.phone);
        }

        await Users.updateById(this.editedTrainee._id, omit(this.editedTrainee, ['_id', 'local']));
        this.traineeEditionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du stagiaire.');
      } finally {
        this.traineeEditionModalLoading = false;
      }
    },
    validateTraineeDeletion (traineeId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir retirer ce stagiaire de la formation ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteTrainee(traineeId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteTrainee (traineeId) {
      try {
        await Courses.deleteTrainee(this.course._id, traineeId);
        this.$emit('refresh');
        NotifyPositive('Stagiaire supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du stagiaire.');
      }
    },
    handleCopySuccess () {
      NotifyPositive('Adresses mail copiées !');
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newTrainee.local.email, type: TRAINEE });
        NotifyPositive('Email envoyé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi de l\' email.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .table-title
    flex: 1

</style>
