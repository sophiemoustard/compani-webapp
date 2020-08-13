<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">{{ tableTitle }}</p>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" :pagination.sync="traineesPagination"
          :visible-columns="traineesVisibleColumns">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-icon color="grey" name="edit" @click.native="openEditionModal(props.row)" />
                    <q-icon color="grey" name="close" @click.native="validateTraineeDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right" v-if="canEdit">
          <q-btn no-caps flat color="primary" icon="add" label="Ajouter un stagiaire" :disable="loading"
            @click="additionModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add trainee modal -->
    <ni-modal v-model="additionModal" @hide="resetAddTraineeForm">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">stagiaire</span> à la formation
      </template>
      <ni-input :disable="!firstStep" in-modal v-model.trim="newTrainee.local.email" required-field :last="firstStep"
        @blur="$v.newTrainee.local.email.$touch" caption="Email" :error-message="emailError($v.newTrainee)"
        :error="$v.newTrainee.local.email.$error" />
      <template v-if="!firstStep">
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model="newTrainee.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" @blur="$v.newTrainee.identity.lastname.$touch" caption="Nom"
          required-field v-model="newTrainee.identity.lastname" :error="$v.newTrainee.identity.lastname.$error" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model.trim="newTrainee.contact.phone"
          caption="Téléphone" @blur="$v.newTrainee.contact.phone.$touch" :error="$v.newTrainee.contact.phone.$error"
          :error-message="phoneNbrError($v.newTrainee)" :last="isIntraCourse" />
        <ni-select v-if="!isIntraCourse" in-modal v-model.trim="newTrainee.company" required-field caption="Structure"
          @blur="$v.newTrainee.company.$touch" :error="$v.newTrainee.company.$error" :options="companyOptions"
          :last="!isIntraCourse" />
      </template>
      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="additionModalLoading" icon-right="add" @click="nextStepAdditionModal" />
        <q-btn v-else no-caps class="full-width modal-btn" color="primary" label="Ajouter à la formation"
          :loading="additionModalLoading" icon-right="add" @click="addTrainee" />
      </template>
    </ni-modal>

    <!-- Trainee edition modal -->
    <ni-modal v-model="editionModal" @hide="resetTraineeEditionForm">
      <template slot="title">
        Éditer un <span class="text-weight-bold">stagiaire</span>
      </template>
      <ni-input in-modal v-model="editedTrainee.local.email" caption="Email" disable />
      <ni-input in-modal v-model="editedTrainee.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="editedTrainee.identity.lastname" :error="$v.editedTrainee.identity.lastname.$error"
        caption="Nom" @blur="$v.editedTrainee.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="editedTrainee.contact.phone" :error="$v.editedTrainee.contact.phone.$error"
        caption="Téléphone" @blur="$v.editedTrainee.contact.phone.$touch"
        :error-message="phoneNbrError($v.editedTrainee)" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer un stagiaire" icon-right="add" color="primary"
          :loading="editionModalLoading" @click="updateTrainee" />
      </template>
    </ni-modal>
</div>
</template>

<script>
import { mapState } from 'vuex';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Users from '@api/Users';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import { INTER_B2B } from '@data/constants';
import { formatPhone, clear, formatPhoneForPayload } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal.js';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'TraineeTable',
  mixins: [userMixin, courseMixin],
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-select': Select,
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
      additionModal: false,
      additionModalLoading: false,
      firstStep: true,
      addNewTraineeCompanyStep: false,
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
        identity: { lastname: { required } },
        local: { email: { required, email } },
        contact: { phone: { frPhoneNumber } },
        company: { required: requiredIf(() => this.course.type === INTER_B2B) },
      },
      editionModal: false,
      editionModalLoading: false,
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
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
    tableTitle () {
      return this.canEdit ? `Participants (${this.traineesNumber})`
        : `Participants de votre structure (${this.traineesNumber})`;
    },
    traineesVisibleColumns () {
      const visibleColumns = ['firstname', 'lastname', 'email', 'phone'];
      if (this.canEdit) visibleColumns.push('actions');
      if (this.isIntraCourse) return visibleColumns;
      return ['company', ...visibleColumns];
    },
  },
  async created () {
    if (!this.isIntraCourse && this.canEdit) await Promise.all([this.refreshCompanies()]);
  },
  methods: {
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = companies
          .map(c => ({ label: c.name, value: c._id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    resetAddTraineeForm () {
      this.firstStep = true;
      this.addNewTraineeCompanyStep = false;
      this.newTrainee = { ...clear(this.newTrainee) };
      this.$v.newTrainee.$reset();
    },
    async nextStepAdditionModal () {
      try {
        this.$v.newTrainee.$touch();
        if (!this.newTrainee.local.email || this.$v.newTrainee.local.email.$error) {
          return NotifyWarning('Champ(s) invalide(s).');
        }

        this.additionModalLoading = true;
        const userInfo = await Users.exists({ email: this.newTrainee.local.email });

        if (this.isIntraCourse) {
          this.newTrainee.company = this.course.company._id;
          if (userInfo.exists) this.addTrainee();
          else this.firstStep = false;
        } else if (userInfo.exists && userInfo.user.company) this.addTrainee();
        else {
          if (userInfo.exists) this.addNewTraineeCompanyStep = true;
          this.firstStep = false;
        }
        this.$v.newTrainee.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.additionModalLoading = false;
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
          const companyFieldError = this.addNewTraineeCompanyStep && this.$v.newTrainee.company.$error;
          const newTraineeFormInvalid = !this.addNewTraineeCompanyStep && this.$v.newTrainee.$invalid;
          if (companyFieldError || newTraineeFormInvalid) return NotifyWarning('Champ(s) invalide(s).');
        }

        this.additionModalLoading = true;
        const payload = this.formatAddTraineePayload();
        await Courses.addTrainee(this.course._id, payload);
        NotifyPositive('Stagiaire ajouté.');

        this.additionModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.additionModalLoading = false;
      }
    },
    async openEditionModal (trainee) {
      this.editedTrainee = {
        ...this.editedTrainee,
        ...pick(trainee, ['_id', 'identity.firstname', 'identity.lastname', 'local.email', 'contact.phone']),
      };
      this.editionModal = true;
    },
    resetTraineeEditionForm () {
      this.$v.editedTrainee.$reset();
      this.editedTrainee = { identity: {}, local: {}, contact: {} };
    },
    async updateTrainee () {
      try {
        this.editionModalLoading = true;
        this.$v.editedTrainee.$touch();
        if (this.$v.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (get(this.editedTrainee, 'contact.phone')) {
          this.editedTrainee.contact.phone = formatPhoneForPayload(this.editedTrainee.contact.phone);
        }

        await Users.updateById(this.editedTrainee._id, omit(this.editedTrainee, ['_id', 'local']));
        this.editionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du stagiaire.');
      } finally {
        this.editionModalLoading = false;
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
  },
};
</script>
