<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom de la session" v-model.trim="course.name" @focus="saveTmp('name')"
          @blur="updateCourse('name')" />
        <ni-select caption="Formateur" v-model.trim="course.trainer" @focus="saveTmp('trainer')"
          @blur="updateCourse('trainer')" :options="trainerOptions" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Dates</p>
      <q-card>
        <ni-responsive-table :data="course.slots" :columns="courseSlotsColumns">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-icon color="grey" name="edit" @click="openCourseSlotEditionModal(props.row)" />
                    <q-icon color="grey" name="delete" @click="validateCourseSlotDeletion(props.row._id)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un créneau"
            @click="courseSlotCreationModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Course slot creation modal -->
    <ni-modal v-model="courseSlotCreationModal" @hide="resetCourseSlotCreationModal">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="newCourseSlot.dates" required-field
        disable-end-date :error="$v.newCourseSlot.dates.$error" @blur="$v.newCourseSlot.dates.$touch" />
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
      <ni-datetime-range caption="Dates et heures" v-model="editedCourseSlot.dates" required-field
        disable-end-date :error="$v.editedCourseSlot.dates.$error" @blur="$v.editedCourseSlot.dates.$touch" />
      <ni-search-address v-model="editedCourseSlot.address" :error-label="addressError"
        @blur="$v.editedCourseSlot.address.$touch" :error="$v.editedCourseSlot.address.$error" inModal last />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="loading" @click="updateCourseSlot" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, requiredIf } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
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
import { formatIdentity } from '@helpers/utils';
import { frAddress } from '@helpers/vuelidateCustomVal.js';

export default {
  name: 'ProfileOrganization',
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
      courseSlots: [],
      loading: false,
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
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'startDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'hours',
          label: 'Créneaux',
          align: 'center',
          field: row => `${this.$moment(row.startDate).format('HH:mm')} - ${this.$moment(row.endDate).format('HH:mm')}`,
        },
        {
          name: 'duration',
          label: 'Durée',
          align: 'center',
          field: row => this.$moment.duration(this.$moment(row.endDate).diff(row.startDate)),
          format: value => value.minutes() ? `${value.hours()}h${value.minutes()}` : `${value.hours()}h`,
        },
        { name: 'address', label: 'Lieu', align: 'left', field: row => get(row, 'address.fullAddress') || '' },
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
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
    await this.refreshTrainers();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.course, path)
    },
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/getCourse', { courseId: this.profileId });
      } catch (e) {
        console.error(e);
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

        await this.refreshCourse();
      } catch (e) {
        console.error(e)
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de l\'ajout du créneau.');
      } finally {
        this.loading = false;
        this.courseSlotCreationModal = false;
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

        await this.refreshCourse();
      } catch (e) {
        console.error(e)
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification du créneau.');
      } finally {
        this.loading = false;
        this.courseSlotEditionModal = false;
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
  },
}
</script>
