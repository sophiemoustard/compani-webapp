<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom de la formation" v-model.trim="course.name" @focus="saveTmp('name')"
          @blur="updateCourse('name')" :error="$v.course.name.$error" />
        <ni-select v-if="trainerInputVisible"  v-model.trim="course.trainer._id" :error="$v.course.trainer.$error"
          @blur="updateCourse('trainer')" :options="trainerOptions" @focus="saveTmp('trainer')" caption="Intervenant" />
      </div>
    </div>
    <div class="q-mb-xl">
      <q-item class="slot-section-title">
        <q-item-section side>
          <q-icon color="black" size="xl" :name="formatSlotTitle.icon" flat dense/>
        </q-item-section>
        <q-item-section>
          <div class="text-weight-bold">{{ formatSlotTitle.title }}</div>
          <div class="slot-section-title-subtitle">{{ formatSlotTitle.subtitle }}</div>
        </q-item-section>
      </q-item>
      <div class="slots-cards-container row">
        <q-card class="slots-cards" v-for="(value, key, index) in courseSlots" :key="index" flat>
          <div class="slots-cards-title">
            <div class="slots-cards-number">{{ index + 1 }}</div>
            <div class="slots-cards-date text-weight-bold">{{ key }}</div>
          </div>
          <div class="slots-cards-content" v-for="slot in value" :key="slot._id">
            <div>
              <q-item>
                <q-item-section side><q-icon name="access_time" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ formatSlotHour(slot) }} ({{getSlotDuration(slot)}})</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side><q-icon name="location_on" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ getSlotAddress(slot) }}</q-item-section>
              </q-item>
            </div>
            <div class="row no-wrap">
              <q-icon color="grey" size="sm" name="edit" @click="openCourseSlotEditionModal(slot)" />
              <q-icon color="grey" size="sm" name="delete" @click="validateCourseSlotDeletion(slot._id)" />
            </div>
          </div>
        </q-card>
      </div>
      <div class="q-mt-md" align="right">
        <q-btn class="add-slot" label="Ajouter un créneau" no-caps flat color="white" icon="add"
          :disable="courseSlotsLoading" @click="courseSlotCreationModal = true" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Participants ({{ traineesNumber }})</p>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" :pagination.sync="traineesPagination"
          :visible-columns="traineesVisibleColumns">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-icon color="grey" name="edit" @click.native="openTraineeEditionModal(props.row)" />
                    <q-icon color="grey" name="close" @click.native="validateTraineeDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn no-caps flat color="primary" icon="add" label="Ajouter un stagiaire"
            @click="addTraineeModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Course slot creation modal -->
    <ni-modal v-model="courseSlotCreationModal" @hide="resetCourseSlotCreationModal"
      container-class="modal-container-md">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="newCourseSlot.dates" required-field disable-end-date
        :error="$v.newCourseSlot.dates.$error" @blur="$v.newCourseSlot.dates.$touch" />
      <ni-search-address v-model="newCourseSlot.address" :error-label="addressError"
        @blur="$v.newCourseSlot.address.$touch" :error="$v.newCourseSlot.address.$error" inModal last />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un créneau" icon-right="add" color="primary"
          :loading="loading" @click="addCourseSlot" />
      </template>
    </ni-modal>

    <!-- Course slot edition modal -->
    <ni-modal v-model="courseSlotEditionModal" @hide="resetCourseSlotEditionModal" container-class="modal-container-md">
      <template slot="title">
        Editer un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="editedCourseSlot.dates" required-field disable-end-date
        :error="$v.editedCourseSlot.dates.$error" @blur="$v.editedCourseSlot.dates.$touch" />
      <ni-search-address v-model="editedCourseSlot.address" :error-label="addressError"
        @blur="$v.editedCourseSlot.address.$touch" :error="$v.editedCourseSlot.address.$error" inModal last />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="loading" @click="updateCourseSlot" />
      </template>
    </ni-modal>

    <!-- Add trainee modal -->
    <ni-modal v-model="addTraineeModal" @hide="resetAddTraineeForm">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">stagiaire</span> à la formation
      </template>
      <ni-input :disable="!firstStep" in-modal v-model.trim="newTrainee.local.email" required-field :last="firstStep"
        @blur="$v.newTrainee.local.email.$touch" caption="Email" :error-label="emailError($v.newTrainee)"
        :error="$v.newTrainee.local.email.$error" />
      <template v-if="!firstStep">
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model="newTrainee.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" @blur="$v.newTrainee.identity.lastname.$touch" caption="Nom"
          required-field v-model="newTrainee.identity.lastname" :error="$v.newTrainee.identity.lastname.$error" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model.trim="newTrainee.contact.phone"
          caption="Téléphone" @blur="$v.newTrainee.contact.phone.$touch" :error="$v.newTrainee.contact.phone.$error"
          :error-label="phoneNbrError($v.newTrainee)" :last="isIntraCourse" />
        <ni-select v-if="!isIntraCourse" in-modal v-model.trim="newTrainee.company" required-field caption="Structure"
          @blur="$v.newTrainee.company.$touch" :error="$v.newTrainee.company.$error" :options="companyOptions"
          :last="!isIntraCourse" />
      </template>

      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="addTraineeModalLoading" icon-right="add" @click="nextStepAddTraineeModal" />
        <q-btn v-else no-caps class="full-width modal-btn" color="primary" label="Ajouter à la formation"
          :loading="addTraineeModalLoading" icon-right="add" @click="addTrainee" />
      </template>
    </ni-modal>

    <!-- Trainee edition modal -->
    <ni-modal v-model="traineeEditionModal" @hide="resetTraineeEditionForm">
      <template slot="title">
        Éditer un <span class="text-weight-bold">stagiaire</span>
      </template>
      <ni-input in-modal v-model="editedTrainee.local.email" caption="Email" disable />
      <ni-input in-modal v-model="editedTrainee.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="editedTrainee.identity.lastname" :error="$v.editedTrainee.identity.lastname.$error"
        caption="Nom" @blur="$v.editedTrainee.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="editedTrainee.contact.phone" :error="$v.editedTrainee.contact.phone.$error"
        caption="Téléphone" @blur="$v.editedTrainee.contact.phone.$touch"
        :error-label="phoneNbrError($v.editedTrainee)" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer un stagiaire" icon-right="add" color="primary"
          :loading="loading" @click="updateTrainee" :disable="$v.editedTrainee.$invalid" />
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
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import Courses from '@api/Courses';
import CourseSlots from '@api/CourseSlots';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';
import DateTimeRange from '@components/form/DatetimeRange';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import {
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
  TRAINER,
  REQUIRED_LABEL,
  INTER_B2B,
  VENDOR,
  CLIENT,
} from '@data/constants';
import { formatIdentity, formatPhone, clear } from '@helpers/utils';
import { frAddress, frPhoneNumber } from '@helpers/vuelidateCustomVal.js';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileOrganization',
  mixins: [userMixin, courseMixin],
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-responsive-table': ResponsiveTable,
    'ni-modal': Modal,
    'ni-search-address': SearchAddress,
    'ni-datetime-range': DateTimeRange,
  },
  data () {
    return {
      trainerOptions: [],
      courseSlots: {},
      loading: false,
      tmpInput: '',
      courseSlotsLoading: false,
      courseSlotCreationModal: false,
      newCourseSlot: {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
      },
      editedCourseSlot: {},
      courseSlotEditionModal: false,
      courseSlotsColumns: [
        { name: 'date', align: 'left', label: 'Dates' },
        { name: 'hours', align: 'center', label: 'Créneaux' },
        { name: 'duration', align: 'center', label: 'Durée' },
        { name: 'address', label: 'Lieu', align: 'left' },
        { name: 'actions', label: '', align: 'center' },
      ],
      courseSlotValidation: {
        dates: {
          startDate: { required },
          endDate: { required },
        },
        address: {
          zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
          street: { required: requiredIf(item => item && !!item.fullAddress) },
          city: { required: requiredIf(item => item && !!item.fullAddress) },
          fullAddress: { frAddress },
        },
      },
      traineesColumns: [
        {
          name: 'company',
          label: 'Structure',
          align: 'left',
          field: row => get(row, 'company.tradeName') || '',
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
          format: (value) => formatPhone(value),
        },
        { name: 'actions', label: '', align: 'left', field: '_id' },
      ],
      traineesPagination: {
        rowsPerPage: 0,
        sortBy: 'lastname',
      },
      addTraineeModal: false,
      addTraineeModalLoading: false,
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
        company: { required: requiredIf(() => { return this.course.type === INTER_B2B; }) },
      },
      traineeEditionModal: false,
      editedTrainee: {
        identity: {},
        contact: {},
        local: {},
      },
      companyOptions: [],
      interfaceType: /\/ad\//.test(this.$router.currentRoute.path) ? VENDOR : CLIENT,
    }
  },
  validations () {
    return {
      course: {
        name: { required },
        trainer: { required },
      },
      newCourseSlot: { ...this.courseSlotValidation },
      editedCourseSlot: { ...this.courseSlotValidation },
      newTrainee: this.traineeValidations,
      editedTrainee: pick(this.traineeValidations, ['identity', 'contact']),
    }
  },
  computed: {
    ...mapState('course', ['course']),
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    addressError () {
      if (!this.$v.newCourseSlot.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    trainerInputVisible () {
      return this.isAdmin && this.interfaceType === VENDOR;
    },
    traineesVisibleColumns () {
      const visibleColumns = ['firstname', 'lastname', 'email', 'phone', 'actions'];
      if (this.isIntraCourse) return visibleColumns;
      return ['company', ...visibleColumns];
    },
    slotsDurationTitle () {
      if (!this.course || !this.course.slots) return '0h';

      const total = this.course.slots.reduce(
        (acc, slot) => acc.add(this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate))),
        this.$moment.duration()
      );

      const paddedMinutes = this.padMinutes(total.minutes());
      const hours = total.days() * 24 + total.hours();

      return paddedMinutes ? `${hours}h${paddedMinutes}` : `${hours}h`;
    },
    formatSlotTitle () {
      const slotList = Object.values(this.courseSlots);

      if (!slotList.length) {
        return { title: 'Pas de date prévue', subtitle: '', icon: 'mdi-calendar-remove' };
      }

      const firstSlot = this.$moment(slotList[0][0].startDate).format('LL');

      if (slotList.length === 1) {
        return {
          title: `1 date, ${this.slotsDurationTitle}`,
          subtitle: `le ${firstSlot}`,
          icon: 'mdi-calendar-range',
        };
      }

      const lastSlot = this.$moment(slotList[slotList.length - 1][0].startDate).format('LL');
      return {
        title: `${slotList.length} dates, ${this.slotsDurationTitle}`,
        subtitle: `du ${firstSlot} au ${lastSlot}`,
        icon: 'mdi-calendar-range',
      };
    },
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    else this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
    if (this.isAdmin) await Promise.all([this.refreshTrainers(), this.refreshCompanies()]);
  },
  methods: {
    get,
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = companies
          .map(c => ({ label: c.tradeName, value: c._id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    padMinutes (minutes) {
      return minutes > 0 && minutes < 10 ? minutes.toString().padStart(2, 0) : minutes;
    },
    async refreshCourse () {
      try {
        this.courseSlotsLoading = true;
        await this.$store.dispatch('course/get', { courseId: this.profileId });
        this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
      } catch (e) {
        console.error(e);
      } finally {
        this.courseSlotsLoading = false;
      }
    },
    async refreshTrainers () {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerOptions = trainers.map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }))
      } catch (e) {
        console.error(e);
      }
    },
    // Course slot
    getSlotDuration (slot) {
      const duration = this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate));

      const paddedMinutes = this.padMinutes(duration.minutes());

      return paddedMinutes ? `${duration.hours()}h${paddedMinutes}` : `${duration.hours()}h`;
    },
    formatSlotHour (slot) {
      return `${this.$moment(slot.startDate).format('HH:mm')} - ${this.$moment(slot.endDate).format('HH:mm')}`;
    },
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
    },
    resetCourseSlotCreationModal () {
      this.newCourseSlot = {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
      };
      this.$v.newCourseSlot.$reset();
    },
    formatCourseSlotCreationPayload (courseSlot) {
      const payload = { ...courseSlot.dates, courseId: this.course._id };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };

      return payload;
    },
    async addCourseSlot () {
      try {
        this.$v.newCourseSlot.$touch();
        if (this.$v.newCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.loading = true;
        await CourseSlots.create(this.formatCourseSlotCreationPayload(this.newCourseSlot));
        NotifyPositive('Créneau ajouté.');

        this.courseSlotCreationModal = false;
        await this.refreshCourse();
      } catch (e) {
        console.error(e)
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du créneau.');
      } finally {
        this.loading = false;
      }
    },
    openCourseSlotEditionModal (slot) {
      this.editedCourseSlot = {
        _id: slot._id,
        dates: pick(slot, ['startDate', 'endDate']),
        address: {},
      }
      if (slot.address) this.editedCourseSlot.address = { ...slot.address };
      this.courseSlotEditionModal = true;
    },
    resetCourseSlotEditionModal () {
      this.editedCourseSlot = {};
      this.$v.editedCourseSlot.$reset();
    },
    formatCourseSlotEditionPayload (courseSlot) {
      const payload = { ...courseSlot.dates, address: {} };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };

      return payload;
    },
    async updateCourseSlot () {
      try {
        this.$v.editedCourseSlot.$touch();
        if (this.$v.editedCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.loading = true;
        const payload = this.formatCourseSlotEditionPayload(this.editedCourseSlot);
        await CourseSlots.update(this.editedCourseSlot._id, payload);
        NotifyPositive('Créneau modifié.');

        this.courseSlotEditionModal = false;
        await this.refreshCourse();
      } catch (e) {
        console.error(e)
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification du créneau.');
      } finally {
        this.loading = false;
      }
    },
    validateCourseSlotDeletion (slotId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce créneau ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCourseSlot(slotId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCourseSlot (slotId) {
      try {
        await CourseSlots.delete(slotId);
        await this.refreshCourse();
        NotifyPositive('Créneau supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du créneau.')
      }
    },
    resetAddTraineeForm () {
      this.firstStep = true;
      this.addNewTraineeCompanyStep = false;
      this.newTrainee = Object.assign({}, clear(this.newTrainee));
      this.$v.newTrainee.$reset();
    },
    async nextStepAddTraineeModal () {
      try {
        this.$v.newTrainee.$touch();
        if (!this.newTrainee.local.email || this.$v.newTrainee.local.email.$error) {
          return NotifyWarning('Champ(s) invalide(s).');
        }

        this.addTraineeModalLoading = true;
        const userInfo = await Users.exists({ email: this.newTrainee.local.email });

        if (this.isIntraCourse) {
          this.newTrainee.company = this.course.company._id;
          if (userInfo.exists) this.addTrainee();
          else this.firstStep = false;
        } else {
          if (userInfo.exists && userInfo.user.company) this.addTrainee();
          else {
            if (userInfo.exists) this.addNewTraineeCompanyStep = true;
            this.firstStep = false;
          }
        }
        this.$v.newTrainee.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.addTraineeModalLoading = false;
      }
    },
    formatAddTraineePayload () {
      const payload = cloneDeep(this.newTrainee);
      if (get(payload, 'identity.firstname') === '') {
        if (get(payload, 'identity.lastname') === '') delete payload.identity;
        else delete payload.identity.firstname;
      }
      if (get(payload, 'contact.phone') === '') delete payload.contact;
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

        this.addTraineeModalLoading = true;
        const payload = this.formatAddTraineePayload();
        await Courses.addTrainee(this.course._id, payload);
        NotifyPositive('Stagiaire ajouté.');

        this.addTraineeModal = false;
        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.addTraineeModalLoading = false;
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
        this.loading = true;
        this.$v.editedTrainee.$touch();
        if (this.$v.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Users.updateById(this.editedTrainee._id, omit(this.editedTrainee, ['_id', 'local']));
        this.traineeEditionModal = false;
        await this.refreshCourse();
        NotifyPositive('Stagiaire modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du stagiaire.');
      } finally {
        this.loading = false;
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
        await this.refreshCourse();
        NotifyPositive('Stagiaire supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du stagiaire.');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.td-border-top td
  border-width: 1px 0 0 0

.th-border-bottom th
  border-width: 0 0 1px 0

.table-top
  font-size: 15px
.slots-cards
  padding: 10px
  &-container
    grid-auto-rows: 1fr
    grid-auto-flow: row
    display: grid
    grid-gap: 20px 10px
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
  &-number
    font-size: 12px
    border: solid 1px
    display: flex
    height: 20px
    width: 20px
    border-radius: 50%
    align-content: center
    justify-content: center
  &-title
    display: flex
    justify-content: space-between
    align-items: center
    margin: 0 10px 10px 10px
  &-date
    color: $primary
    font-size: 16px
  &-content
    margin: 5px 10px
    display: flex
    justify-content: space-between
  &-content > div > .q-item
    font-size: 14px
    padding: 0px
    min-height: auto
  &-content > div > .q-icon
    cursor: pointer
.add-slot
  background: $primary
.slot-section-title
  padding: 0;
  margin: 10px 0px
  &-subtitle
     font-style: italic
     font-size: 16px
     @media (max-width: 767px)
      font-size: 13px
</style>
