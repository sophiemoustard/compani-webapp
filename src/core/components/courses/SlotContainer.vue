<template>
  <div>
    <div class="q-mb-xl">
      <q-item class="slot-section-title">
        <q-item-section side>
          <q-icon color="copper-grey-700" size="xl" :name="formatSlotTitle.icon" flat dense />
        </q-item-section>
        <q-item-section>
          <div class="text-weight-bold">{{ formatSlotTitle.title }}</div>
          <div class="slot-section-title-subtitle">{{ formatSlotTitle.subtitle }}</div>
        </q-item-section>
      </q-item>
      <div v-if="!course.slots.length && isVendorInterface && isAdmin" class="row gutter-profile">
        <ni-date-input caption="Date de démarrage souhaitée" :model-value="course.estimatedStartDate"
          @update:model-value="updateEstimatedStartDate($event)" class="col-xs-12 col-md-6" />
      </div>
      <div class="slots-cells-container row">
        <q-card class="slots-cells" v-for="(value, key, index) in courseSlots" :key="index" flat>
          <div class="slots-cells-title">
            <div class="slots-cells-number">{{ index + 1 }}</div>
            <div class="slots-cells-date text-weight-bold">{{ key }}</div>
          </div>
          <div :class="['slots-cells-content', { 'cursor-pointer': canEdit && !course.archivedAt }]"
            v-for="slot in value" :key="slot._id" @click="openEditionModal(slot)">
              <q-item class="text-weight-bold">{{ getStepTitle(slot) }}</q-item>
              <q-item>{{ formatIntervalHourly(slot) }} ({{ getDuration(slot) }})</q-item>
              <q-item v-if="slot.step.type === ON_SITE">{{ getSlotAddress(slot) }}</q-item>
              <q-item v-else>
                <a class="ellipsis" :href="slot.meetingLink" target="_blank" @click="$event.stopPropagation()">
                  {{ slot.meetingLink }}
                </a>
                {{ !slot.meetingLink ? 'Lien vers la visio non renseigné' : '' }}
              </q-item>
          </div>
        </q-card>
        <q-card :class="['slots-cells', { 'cursor-pointer': canEdit && !course.archivedAt }]"
          v-for="(value, index) in courseSlotsToPlan" :key="Object.keys(courseSlots).length + index + 1" flat
          @click="openEditionModal(value)">
          <div class="slots-cells-title">
            <div class="slots-cells-number">{{ Object.keys(courseSlots).length + index + 1 }}</div>
            <div class="slots-cells-date text-weight-bold">Date à planifier</div>
          </div>
          <div class="to-plan-text">Créneau à planifier</div>
        </q-card>
      </div>
      <div class="q-mt-md" v-if="canEdit && isAdmin && isVendorInterface" align="right">
        <ni-button class="add-slot" label="Ajouter un créneau" color="white" icon="add"
          :disable="loading || addDateToPlanloading" @click="openSlotCreationModal" />
        <ni-button v-if="isVendorInterface" class="add-slot" label="Ajouter une date à planifier" color="white"
          icon="add" @click="addDateToPlan" :disable="addDateToPlanloading" />
      </div>
    </div>

    <slot-creation-modal v-model="creationModal" :new-course-slot="newCourseSlot" :validations="v$.newCourseSlot"
      :step-options="stepOptions" :loading="modalLoading" @hide="resetCreationModal" @submit="addCourseSlot"
      :link-error-message="linkErrorMessage" @update="setCourseSlot" />

    <slot-edition-modal v-model="editionModal" :edited-course-slot="editedCourseSlot" :step-options="stepOptions"
      :validations="v$.editedCourseSlot" @hide="resetEditionModal" :loading="modalLoading" @delete="deleteCourseSlot"
      @submit="updateCourseSlot" :link-error-message="linkErrorMessage" @update="setCourseSlot" :is-admin="isAdmin"
      :is-vendor-interface="isVendorInterface" />
</div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import has from 'lodash/has';
import set from 'lodash/set';
import groupBy from 'lodash/groupBy';
import pick from 'lodash/pick';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import CourseSlots from '@api/CourseSlots';
import Button from '@components/Button';
import SlotEditionModal from '@components/courses/SlotEditionModal';
import SlotCreationModal from '@components/courses/SlotCreationModal';
import DateInput from '@components/form/DateInput';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { E_LEARNING, ON_SITE, REMOTE } from '@data/constants';
import { formatQuantity } from '@helpers/utils';
import { formatDate, formatDuration, formatIntervalHourly, getDuration } from '@helpers/date';
import { frAddress, minDate, maxDate, urlAddress } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { courseMixin } from '@mixins/courseMixin';
import { validationMixin } from '@mixins/validationMixin';

export default {
  name: 'SlotContainer',
  mixins: [courseMixin, validationMixin],
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  },
  components: {
    'slot-edition-modal': SlotEditionModal,
    'slot-creation-modal': SlotCreationModal,
    'ni-button': Button,
    'ni-date-input': DateInput,
  },
  emits: ['refresh', 'update'],
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    const isVendorInterface = /\/ad\//.test(this.$route.path);

    return {
      courseSlots: {},
      addDateToPlanloading: false,
      modalLoading: false,
      creationModal: false,
      newCourseSlot: {
        dates: {
          startDate: moment().startOf('d').hours(9).toISOString(),
          endDate: moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
        meetingLink: '',
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
      isVendorInterface,
      ON_SITE,
      linkErrorMessage: 'Le lien doit commencer par http:// ou https://',
    };
  },
  validations () {
    return {
      newCourseSlot: this.courseSlotValidation(this.newCourseSlot),
      editedCourseSlot: this.courseSlotValidation(this.editedSlot),
    };
  },
  computed: {
    ...mapState('course', ['course']),
    slotsDurationTitle () {
      if (!this.course || !this.course.slots) return '0h';

      const total = this.course.slots.reduce(
        (acc, slot) => acc.add(moment.duration(moment(slot.endDate).diff(slot.startDate))),
        moment.duration()
      );

      return formatDuration(total);
    },
    formatSlotTitle () {
      const slotsToPlanLength = this.courseSlotsToPlan.length;
      const slotList = Object.values(this.courseSlots);
      const totalDate = slotsToPlanLength + slotList.length;
      if (!totalDate) return { title: 'Pas de date prévue', subtitle: '', icon: 'mdi-calendar-remove' };

      const slotsToPlanTitle = slotsToPlanLength ? ` dont ${slotsToPlanLength} à planifier, ` : '';

      let subtitle = '';
      if (slotList.length) {
        const firstSlot = moment(slotList[0][0].startDate).format('LL');
        const lastSlot = moment(slotList[slotList.length - 1][0].startDate).format('LL');
        subtitle = `du ${firstSlot} au ${lastSlot}`;
      }

      return {
        title: `${formatQuantity('date', totalDate)}, ${slotsToPlanTitle}${this.slotsDurationTitle}`,
        subtitle,
        icon: 'mdi-calendar-range',
      };
    },
    stepsLength () {
      return this.course.subProgram.steps.length;
    },
    stepOptions () {
      if (!this.stepsLength) return [{ label: 'Aucune étape disponible', value: '' }];
      return [
        { label: 'Pas d\'étape spécifiée', value: '' },
        ...this.course.subProgram.steps.map((step, index) => ({
          label: `${index + 1} - ${step.name} (${this.getStepTypeLabel(step.type)})`,
          value: step._id,
          type: step.type,
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
    getDuration,
    formatIntervalHourly,
    courseSlotValidation (slot) {
      return {
        step: { required },
        address: {
          zipCode: { required: requiredIf(get(slot, 'address.fullAddress')) },
          street: { required: requiredIf(get(slot, 'address.fullAddress')) },
          city: { required: requiredIf(get(slot, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        meetingLink: { urlAddress },
        dates: {
          startDate: { required },
          endDate: {
            required,
            ...(!!get(slot, 'dates.startDate') && {
              maxDate: maxDate(moment(slot.dates.startDate).endOf('d').toISOString()),
              minDate: minDate(slot.dates.startDate),
            }),
          },
        },
      };
    },
    groupByCourses () {
      this.courseSlots = groupBy(this.course.slots.filter(slot => !!slot.startDate), s => formatDate(s.startDate));
      this.courseSlotsToPlan = this.course.slotsToPlan || [];
    },
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
    },
    resetCreationModal () {
      this.newCourseSlot = {
        dates: {
          startDate: moment().startOf('d').hours(9).toISOString(),
          endDate: moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
        meetingLink: '',
        step: '',
      };
      this.v$.newCourseSlot.$reset();
    },
    formatCreationPayload (courseSlot) {
      return {
        ...courseSlot.dates,
        course: this.course._id,
        ...(get(courseSlot, 'address.fullAddress') && { address: courseSlot.address }),
        ...(courseSlot.meetingLink && { meetingLink: courseSlot.meetingLink }),
        ...(courseSlot.step && { step: courseSlot.step }),
      };
    },
    openEditionModal (slot) {
      if (!this.canEdit) return;
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas éditer un créneau d\'une formation archivée.');
      }

      const defaultDate = {
        startDate: moment().startOf('d').hours(9).toISOString(),
        endDate: moment().startOf('d').hours(12).toISOString(),
      };
      this.editedCourseSlot = {
        _id: slot._id,
        dates: has(slot, 'startDate') ? pick(slot, ['startDate', 'endDate']) : defaultDate,
        address: {},
        meetingLink: get(slot, 'meetingLink') || '',
        step: get(slot, 'step._id') || '',
      };
      if (slot.address) this.editedCourseSlot.address = { ...slot.address };
      this.editionModal = true;
    },
    resetEditionModal () {
      this.editedCourseSlot = {};
      this.v$.editedCourseSlot.$reset();
    },
    formatEditionPayload (courseSlot) {
      const stepType = this.course.subProgram.steps.find(step => step._id === courseSlot.step).type;

      return {
        ...courseSlot.dates,
        ...(stepType === ON_SITE && get(courseSlot, 'address.fullAddress') && { address: courseSlot.address }),
        ...(stepType === REMOTE && courseSlot.meetingLink && { meetingLink: courseSlot.meetingLink }),
        step: courseSlot.step,
      };
    },
    async addCourseSlot () {
      try {
        this.v$.newCourseSlot.$touch();
        const isValid = await this.waitForFormValidation(this.v$.newCourseSlot);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        await CourseSlots.create(this.formatCreationPayload(this.newCourseSlot));
        NotifyPositive('Créneau ajouté.');

        this.creationModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    openSlotCreationModal () {
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter un créneau à une formation archivée.');
      }

      this.creationModal = true;
    },
    async addDateToPlan () {
      try {
        if (this.course.archivedAt) {
          return NotifyWarning('Vous ne pouvez pas ajouter un créneau à une formation archivée.');
        }

        this.addDateToPlanloading = true;
        await CourseSlots.create(this.formatCreationPayload({}));
        NotifyPositive('Date à planifier ajoutée.');

        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la date à planifier.');
      } finally {
        this.addDateToPlanloading = false;
      }
    },
    async updateCourseSlot () {
      try {
        this.v$.editedCourseSlot.$touch();
        const isValid = await this.waitForFormValidation(this.v$.editedCourseSlot);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        const payload = this.formatEditionPayload(this.editedCourseSlot);
        await CourseSlots.update(this.editedCourseSlot._id, payload);
        NotifyPositive('Créneau modifié.');

        this.editionModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification du créneau.');
      } finally {
        this.modalLoading = false;
      }
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
        if (e.data.statusCode === 409) return NotifyWarning('Créneau émargé : impossible de le supprimer');
        if (e.data.statusCode === 403) return NotifyWarning('Seul créneau de l\'étape : impossible de le supprimer');
        NotifyNegative('Erreur lors de la suppression du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    getStepTitle (slot) {
      if (!slot.step) return '';
      const step = this.stepOptions.find(option => option.value === slot.step._id);
      return step ? step.label : '';
    },
    setCourseSlot (payload) {
      const { path, value } = payload;
      if (this.creationModal) set(this.newCourseSlot, path, value);
      else if (this.editionModal) set(this.editedCourseSlot, path, value);
    },
    async updateEstimatedStartDate (event) {
      this.$emit('update', set(this.course, 'estimatedStartDate', event));
    },
  },

};
</script>

<style lang="sass" scoped>
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
    background-color: $copper-100
    flex-direction: column
    border-radius: 4px !important
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
  padding: 0
  margin: 10px 0px
  &-subtitle
    font-style: italic
    font-size: 16px
    @media screen and (max-width: 767px)
      font-size: 13px

.to-plan-text
  text-decoration: underline
  color: $secondary
  font-size: 14px
</style>
