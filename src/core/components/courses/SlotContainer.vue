<template>
  <div>
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
      <div class="slots-cells-container row">
        <q-card class="slots-cells" v-for="(value, key, index) in courseSlots" :key="index" flat>
          <div class="slots-cells-title">
            <div class="slots-cells-number">{{ index + 1 }}</div>
            <div class="slots-cells-date text-weight-bold">{{ key }}</div>
          </div>
          <div :class="['slots-cells-content', { 'cursor-pointer': canEdit }]" v-for="slot in value" :key="slot._id"
            @click="openEditionModal(slot)">
              <q-item class="text-weight-bold">{{ slot.step ? slot.step.name : '' }}</q-item>
              <q-item>{{ formatSlotHour(slot) }} ({{getSlotDuration(slot)}})</q-item>
              <q-item>{{ getSlotAddress(slot) }}</q-item>
          </div>
        </q-card>
        <q-card :class="['slots-cells', { 'cursor-pointer' : canEdit }]" v-for="(value, index) in courseSlotsToPlan"
          :key="Object.keys(courseSlots).length + index + 1" flat @click="openEditionModal(value)">
          <div class="slots-cells-title">
            <div class="slots-cells-number">{{ Object.keys(courseSlots).length + index + 1 }}</div>
            <div class="slots-cells-date text-weight-bold">Date à planifier</div>
          </div>
          <div class="to-plan-text">Créneau à planifier</div>
        </q-card>
      </div>
      <div class="q-mt-md" v-if="canEdit" align="right">
        <q-btn class="add-slot" label="Ajouter un créneau" no-caps flat color="white" icon="add"
          :disable="loading || addDateToPlanloading" @click="creationModal = true" />
        <q-btn class="add-slot" label="Ajouter une date à planifier" no-caps flat color="white" icon="add"
          :disable="addDateToPlanloading" @click="addDateToPlan" />
      </div>
    </div>

    <!-- Course slot creation modal -->
    <ni-modal v-model="creationModal" @hide="resetCreationModal"
      container-class="modal-container-md">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="newCourseSlot.dates" required-field disable-end-date
        :error="$v.newCourseSlot.dates.$error" @blur="$v.newCourseSlot.dates.$touch" />
      <ni-search-address v-model="newCourseSlot.address" :error-message="addressError"
        @blur="$v.newCourseSlot.address.$touch" :error="$v.newCourseSlot.address.$error" inModal last />
      <ni-select in-modal caption="Etape" :options="stepOptions" v-model="newCourseSlot.step" required-field
        :disable="!stepsLength" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un créneau" icon-right="add" color="primary"
          :loading="modalLoading" @click="addCourseSlot" />
      </template>
    </ni-modal>

    <!-- Course slot edition modal -->
    <ni-modal v-model="editionModal" @hide="resetEditionModal" container-class="modal-container-md">
      <template slot="title">
        Editer un <span class="text-weight-bold">créneau</span>
      </template>
      <div class="modal-icon">
        <q-icon class="cursor-pointer" color="grey" size="sm" name="delete"
          @click="validateDeletion(editedCourseSlot._id)" />
      </div>
      <ni-datetime-range caption="Dates et heures" v-model="editedCourseSlot.dates" required-field disable-end-date
        :error="$v.editedCourseSlot.dates.$error" @blur="$v.editedCourseSlot.dates.$touch" />
      <ni-search-address v-model="editedCourseSlot.address" :error-message="addressError"
        @blur="$v.editedCourseSlot.address.$touch" :error="$v.editedCourseSlot.address.$error" inModal last />
      <ni-select in-modal caption="Etape" :options="stepOptions" v-model="editedCourseSlot.step" required-field
        :disable="!stepsLength" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="modalLoading" @click="updateCourseSlot" />
      </template>
    </ni-modal>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import has from 'lodash/has';
import groupBy from 'lodash/groupBy';
import pick from 'lodash/pick';
import { required, requiredIf } from 'vuelidate/lib/validators';
import CourseSlots from '@api/CourseSlots';
import { REQUIRED_LABEL, E_LEARNING } from '@data/constants';
import { frAddress } from '@helpers/vuelidateCustomVal.js';
import SearchAddress from '@components/form/SearchAddress';
import DateTimeRange from '@components/form/DatetimeRange';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'SlotContainer',
  mixins: [courseMixin],
  metadata: { title: 'Fiche formation' },
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-datetime-range': DateTimeRange,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  data () {
    return {
      courseSlots: {},
      addDateToPlanloading: false,
      modalLoading: false,
      creationModal: false,
      newCourseSlot: {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
        step: '',
      },
      editedCourseSlot: {},
      editionModal: false,
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
    }
  },
  validations () {
    return {
      newCourseSlot: { ...this.courseSlotValidation },
      editedCourseSlot: { ...this.courseSlotValidation },
    }
  },
  computed: {
    ...mapState('course', ['course']),
    addressError () {
      if (!this.$v.newCourseSlot.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
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
      const slotsToPlanLength = this.courseSlotsToPlan.length;
      const slotList = Object.values(this.courseSlots);
      const totalDate = slotsToPlanLength + slotList.length;
      if (!totalDate) return { title: 'Pas de date prévue', subtitle: '', icon: 'mdi-calendar-remove' };

      const slotsToPlanTitle = slotsToPlanLength ? ` dont ${slotsToPlanLength} à planifier, ` : '';

      let subtitle = '';
      if (slotList.length) {
        const firstSlot = this.$moment(slotList[0][0].startDate).format('LL');
        const lastSlot = this.$moment(slotList[slotList.length - 1][0].startDate).format('LL');
        subtitle = `du ${firstSlot} au ${lastSlot}`;
      }

      return {
        title: `${totalDate} date${totalDate > 1 ? 's' : ''}, ${slotsToPlanTitle}${this.slotsDurationTitle}`,
        subtitle,
        icon: 'mdi-calendar-range',
      };
    },
    stepsLength () {
      return this.course.program.steps.length;
    },
    stepOptions () {
      if (!this.stepsLength) return [{ label: 'Aucune étape disponible', value: '' }];
      return [
        { label: 'Pas d\'étape spécifiée', value: '' },
        ...this.course.program.steps.map((step, index) => ({
          label: `${index + 1} - ${step.name}${step.type === E_LEARNING ? ' (eLearning)' : ''}`,
          value: step._id,
          disable: step.type === E_LEARNING,
        })),
      ];
    },
  },
  watch: {
    course () {
      this.groupByCourses();
    },
  },
  async created () {
    if (!this.course) this.$emit('refresh');
    else this.groupByCourses();
  },
  methods: {
    groupByCourses () {
      this.courseSlots = groupBy(
        this.course.slots.filter(slot => !!slot.startDate),
        s => this.$moment(s.startDate).format('DD/MM/YYYY')
      );
      this.courseSlotsToPlan = this.course.slotsToPlan || [];
    },
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
    resetCreationModal () {
      this.newCourseSlot = {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
        step: '',
      };
      this.$v.newCourseSlot.$reset();
    },
    formatCreationPayload (courseSlot) {
      const payload = { ...courseSlot.dates, courseId: this.course._id };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };
      if (courseSlot.step) payload.step = courseSlot.step;

      return payload;
    },
    openEditionModal (slot) {
      if (!this.canEdit) return;
      const defaultDate = {
        startDate: this.$moment().startOf('d').hours(9).toISOString(),
        endDate: this.$moment().startOf('d').hours(12).toISOString(),
      };
      this.editedCourseSlot = {
        _id: slot._id,
        dates: has(slot, 'startDate') ? pick(slot, ['startDate', 'endDate']) : defaultDate,
        address: {},
        step: get(slot, 'step._id') || '',
      }
      if (slot.address) this.editedCourseSlot.address = { ...slot.address };
      this.editionModal = true;
    },
    resetEditionModal () {
      this.editedCourseSlot = {};
      this.$v.editedCourseSlot.$reset();
    },
    formatEditionPayload (courseSlot) {
      const payload = { ...courseSlot.dates, address: {} };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };
      if (courseSlot.step) payload.step = courseSlot.step;

      return payload;
    },
    async addCourseSlot () {
      try {
        this.$v.newCourseSlot.$touch();
        if (this.$v.newCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        await CourseSlots.create(this.formatCreationPayload(this.newCourseSlot));
        NotifyPositive('Créneau ajouté.');

        this.creationModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e)
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    async addDateToPlan () {
      try {
        this.addDateToPlanloading = true;
        await CourseSlots.create(this.formatCreationPayload({}));
        NotifyPositive('Date à planifier ajoutée.');

        this.$emit('refresh');
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de l\'ajout de la date à planifier.');
      } finally {
        this.addDateToPlanloading = false;
      }
    },
    async updateCourseSlot () {
      try {
        this.$v.editedCourseSlot.$touch();
        if (this.$v.editedCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        const payload = this.formatEditionPayload(this.editedCourseSlot);
        await CourseSlots.update(this.editedCourseSlot._id, payload);
        NotifyPositive('Créneau modifié.');

        this.editionModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e)
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    validateDeletion (slotId) {
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
        this.modalLoading = true;
        await CourseSlots.delete(slotId);
        this.$emit('refresh');
        NotifyPositive('Créneau supprimé');
        this.editionModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du créneau.')
      } finally {
        this.modalLoading = false;
      }
    },
  },

}
</script>

<style lang="stylus" scoped>
.slots-cells
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
    background-color: $primary-light
    flex-direction: column
  &-content > .q-item
    font-size: 14px
    padding: 0px
    min-height: auto
    margin: 0px 10px

.add-slot
  background: $primary
  margin-left: 10px
  margin-top: 10px
.slot-section-title
  padding: 0;
  margin: 10px 0px
  &-subtitle
     font-style: italic
     font-size: 16px
     @media (max-width: 767px)
      font-size: 13px

.to-plan-text
  text-decoration: underline
  color: $secondary
  font-size: 14px

.modal-icon
  display: flex;
  justify-content: flex-end
</style>
