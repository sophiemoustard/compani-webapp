<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom de la formation" v-model.trim="course.name" @focus="saveTmp('name')"
          @blur="updateCourse('name')" :error="$v.course.name.$error" />
        <ni-select caption="Formateur" v-model.trim="course.trainer" @focus="saveTmp('trainer')"
          @blur="updateCourse('trainer')" :options="trainerOptions" :error="$v.course.trainer.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Dates ({{ Object.keys(courseSlots).length }})</p>
      <q-card>
        <ni-responsive-table :data="Object.values(courseSlots)" :columns="courseSlotsColumns" separator="none"
          :loading="courseSlotsLoading">
          <template v-slot:header="{ props }">
            <q-tr :props="props" :class="{ 'th-border-bottom': Object.values(courseSlots).length === 0 }">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
                <template v-if="col.name === 'hours'">
                  Créneaux ({{ course.slots ? course.slots.length : 0 }})
                </template>
                <template v-else-if="col.name === 'duration'">Durée ({{ slotsDurationColumnTitle }})</template>
                <template v-else>{{ col.label }}</template>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="{ props }">
            <q-tr v-for="(slot, index) in props.row" :key="slot._id" :props="props"
              :class="{ 'td-border-top': index === 0 && !$q.platform.is.mobile }">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'date' && (index === 0 || $q.platform.is.mobile)">
                  {{ $moment(slot.startDate).format('DD/MM/YYYY') }}
                </template>
                <template v-else-if="col.name === 'hours'">
                  {{ $moment(slot.startDate).format('HH:mm') }} - {{ $moment(slot.endDate).format('HH:mm') }}
                </template>
                <template v-else-if="col.name === 'duration'">
                  {{ getSlotDuration(slot) }}
                </template>
                <template v-else-if="col.name === 'address'">
                  {{ get(slot, 'address.fullAddress') || '' }}
                </template>
                <template v-else-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-icon color="grey" name="edit" @click="openCourseSlotEditionModal(slot)" />
                    <q-icon color="grey" name="delete" @click="validateCourseSlotDeletion(slot._id)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un créneau"
            @click="courseSlotCreationModal = true" :disable="courseSlotsLoading" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Participants ({{ traineesNumber }})</p>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" :pagination.sync="traineesPagination">
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
            @click="traineeCreationModal = true" />
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

    <!-- Trainee creation modal -->
    <ni-modal v-model="traineeCreationModal" @hide="resetTraineeCreationForm">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">stagiaire</span> à la formation
      </template>
      <ni-input in-modal v-model="newTrainee.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="newTrainee.identity.lastname" :error="$v.newTrainee.identity.lastname.$error"
        caption="Nom" @blur="$v.newTrainee.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model="newTrainee.local.email" :error="$v.newTrainee.local.email.$error" caption="Email"
        @blur="$v.newTrainee.local.email.$touch" :error-label="emailError($v.newTrainee)" required-field />
      <ni-input in-modal v-model.trim="newTrainee.contact.phone" :error="$v.newTrainee.contact.phone.$error"
        caption="Téléphone" @blur="$v.newTrainee.contact.phone.$touch" :error-label="phoneNbrError($v.newTrainee)" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter à la formation" icon-right="add" color="primary"
          :loading="loading" @click="addTrainee" :disable="$v.newTrainee.$invalid" />
      </template>
    </ni-modal>

    <!-- Trainee edition modal -->
    <ni-modal v-model="traineeEditionModal" @hide="resetTraineeEditionForm">
      <template slot="title">
        Éditer un <span class="text-weight-bold">stagiaire</span>
      </template>
      <ni-input in-modal v-model="editedTrainee.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="editedTrainee.identity.lastname" :error="$v.editedTrainee.identity.lastname.$error"
        caption="Nom" @blur="$v.editedTrainee.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model="editedTrainee.local.email" caption="Email" disable />
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
import { mapGetters } from 'vuex';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import Courses from '@api/Courses';
import CourseSlots from '@api/CourseSlots';
import Users from '@api/Users';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';
import DateTimeRange from '@components/form/DatetimeRange';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { TRAINER, REQUIRED_LABEL } from '@data/constants';
import { formatIdentity, formatPhone, clear, removeEmptyProps } from '@helpers/utils';
import { frAddress, frPhoneNumber } from '@helpers/vuelidateCustomVal.js';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'ProfileOrganization',
  mixins: [userMixin],
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
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => get(row, 'identity.firstname', '') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => get(row, 'identity.lastname', '') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => get(row, 'local.email', '') || '',
        },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone', '') || '',
          format: (value) => formatPhone(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      traineesPagination: {
        rowsPerPage: 0,
        sortBy: 'lastname',
      },
      traineeCreationModal: false,
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
      },
      traineeEditionModal: false,
      editedTrainee: {
        identity: {},
        contact: {},
        local: {},
      },
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
    ...mapGetters({ course: 'course/getCourse' }),
    addressError () {
      if (!this.$v.newCourseSlot.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    slotsDurationColumnTitle () {
      if (!this.course || !this.course.slots) return '0h';
      const total = this.course.slots.reduce(
        (acc, slot) => acc.add(this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate))),
        this.$moment.duration()
      );

      const paddedMinutes = this.padMinutes(total.minutes());

      return paddedMinutes ? `${total.hours()}h${paddedMinutes}` : `${total.hours()}h`;
    },
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
    else this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
    await this.refreshTrainers();
  },
  methods: {
    get,
    saveTmp (path) {
      this.tmpInput = get(this.course, path)
    },
    padMinutes (minutes) {
      return minutes > 0 && minutes < 10 ? minutes.toString().padStart(2, 0) : minutes;
    },
    async refreshCourse () {
      try {
        this.courseSlotsLoading = true;
        await this.$store.dispatch('course/getCourse', { courseId: this.profileId });
        this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
      } catch (e) {
        console.error(e);
      } finally {
        this.courseSlotsLoading = false;
      }
    },
    async refreshTrainers () {
      try {
        const trainers = await Users.list({ role: [TRAINER] });
        this.trainerOptions = trainers.map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }))
      } catch (e) {
        console.error(e);
      }
    },
    async updateCourse (path) {
      try {
        const value = get(this.course, path);
        if (this.tmpInput === value) return;
        this.$v.course[path].$touch();
        if (this.$v.course[path].$error) return NotifyWarning('Champ(s) invalide(s).');

        const payload = set({}, path, value);
        await Courses.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    // Course slot
    getSlotDuration (slot) {
      const duration = this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate));

      const paddedMinutes = this.padMinutes(duration.minutes());

      return paddedMinutes ? `${duration.hours()}h${paddedMinutes}` : `${duration.hours()}h`;
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
    resetTraineeCreationForm () {
      this.newTrainee = Object.assign({}, clear(this.newTrainee));
      this.$v.newTrainee.$reset();
    },
    formatTraineeCreationPayload (payload) {
      return { ...removeEmptyProps(payload), company: this.course.companies[0]._id };
    },
    async addTrainee () {
      try {
        this.$v.newTrainee.$touch();
        if (this.$v.newTrainee.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.loading = true;
        const payload = this.formatTraineeCreationPayload(this.newTrainee);
        await Courses.addTrainee(this.course._id, payload);
        NotifyPositive('Stagiaire ajouté.');

        this.traineeCreationModal = false;
        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative('Ce stagiaire n\'est pas relié à la structure de la formation');
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.loading = false;
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
</style>
