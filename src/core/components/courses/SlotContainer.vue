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
      <q-card>
        <q-card v-for="(step, index) in stepList" :key="step.key" class="q-pa-md">
          <div v-if="step.type === 'eLearning'">
            <div class="row items-center q-pa-md">
              <div class="index">{{ index + 1 }}</div>
              <div class="q-mx-md">
                <div>{{ step.name }}</div>
                <div class="type">{{ step.type }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="!!courseSlotsByStepAndDate[step.key] &&
            Object.keys(courseSlotsByStepAndDate[step.key]).some(key => key === '')">
            <div class="to-plan">
              <div class="to-plan-header">Créneaux à programmer</div>
              <div class="row items-center q-pa-md">
                <div class="index">{{ index + 1 }}</div>
                <div class="q-mx-md">
                  <div>{{ step.name }}</div>
                  <div class="type">{{ step.type }}</div>
                </div>
              </div>
              <div class="slots-container">
                <div v-for="slot in Object.values(pick(courseSlotsByStepAndDate[step.key], '')).flat()" :key="slot._id"
                  class="row q-ml-xl q-mb-md">
                  <div class="clickable-name text-orange-500 cursor-pointer q-mr-md" @click="openEditionModal(slot)">
                    créneau à planifier
                  </div>
                  <ni-button icon="edit" @click="openEditionModal(slot)" size="10px" color="copper-grey-500" />
                </div>
                <div v-for="day in Object.entries(omit(courseSlotsByStepAndDate[step.key], ''))" :key="day"
                  class="row q-ml-xl q-my-md">
                  <div class="text-weight-bold q-mr-md">{{ day[0] }}</div>
                  <div>
                    <div v-for="slot in day[1]" :key="slot._id" class="row justify-between">
                      <div class="q-mr-md">{{ formatIntervalHourly(slot) }} ({{ getDuration(slot) }})</div>
                      <div class="q-mr-md">{{ getSlotAddress(slot) }}</div>
                      <ni-button icon="edit" @click="openEditionModal(slot)" size="10px" color="copper-grey-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="q-mt-md" v-if="canEdit && isAdmin && isVendorInterface" align="right">
                <ni-button label="Ajouter un créneau" color="primary" icon="add"
                  @click="addDateToPlan(step.key)" :disable="addDateToPlanLoading" />
              </div>
            </div>
          </div>
          <div v-else-if="!!courseSlotsByStepAndDate[step.key] &&
            Object.keys(courseSlotsByStepAndDate[step.key]).every(key => key !== '')">
            <div class="defined">
              <div class="row items-center q-pa-md">
                <div class="index">{{ index + 1 }}</div>
                <div class="q-mx-md">
                  <div>{{ step.name }}</div>
                  <div class="type">{{ step.type }}</div>
                </div>
              </div>
              <div class="slots-container">
                <div v-for="day in Object.entries(courseSlotsByStepAndDate[step.key])" :key="day"
                  class="row q-ml-xl q-my-md">
                  <div class="text-weight-bold q-mr-md">{{ day[0] }}</div>
                  <div>
                    <div v-for="slot in day[1]" :key="slot._id" class="row justify-between">
                      <div class="q-mr-md">{{ formatIntervalHourly(slot) }} ({{ getDuration(slot) }})</div>
                      <div class="q-mr-md">{{ getSlotAddress(slot) }}</div>
                      <ni-button icon="edit" @click="openEditionModal(slot)" size="10px" color="copper-grey-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="q-mt-md" v-if="canEdit && isAdmin && isVendorInterface" align="right">
                <ni-button label="Ajouter un créneau" color="primary" icon="add"
                  @click="addDateToPlan(step.key)" :disable="addDateToPlanLoading" />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="to-plan">
              <div class="to-plan-header">Créneaux à programmer</div>
              <div class="row items-center q-pa-md">
                <div class="index">{{ index + 1 }}</div>
                <div class="q-mx-md">
                  <div>{{ step.name }}</div>
                  <div class="type">{{ step.type }}</div>
                </div>
              </div>
              <div class="q-mt-md" v-if="canEdit && isAdmin && isVendorInterface" align="right">
                <ni-button label="Ajouter un créneau" color="primary" icon="add"
                  @click="addDateToPlan(step.key)" :disable="addDateToPlanLoading" />
              </div>
            </div>
          </div>
        </q-card>
      </q-card>
    </div>

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
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import CourseSlots from '@api/CourseSlots';
import Button from '@components/Button';
import SlotEditionModal from '@components/courses/SlotEditionModal';
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
    courseSlotsByStepAndDate: { type: Object, default: () => ({}) },
  },
  components: {
    'slot-edition-modal': SlotEditionModal,
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
      addDateToPlanLoading: false,
      modalLoading: false,
      editedCourseSlot: {},
      editionModal: false,
      isVendorInterface,
      ON_SITE,
      linkErrorMessage: 'Le lien doit commencer par http:// ou https://',
    };
  },
  validations () {
    return {
      editedCourseSlot: {
        step: { required },
        address: {
          zipCode: { required: requiredIf(get(this.editedSlot, 'address.fullAddress')) },
          street: { required: requiredIf(get(this.editedSlot, 'address.fullAddress')) },
          city: { required: requiredIf(get(this.editedSlot, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        meetingLink: { urlAddress },
        dates: {
          startDate: { required },
          endDate: {
            required,
            ...(!!get(this.editedSlot, 'dates.startDate') && {
              maxDate: maxDate(moment(this.editedSlot.dates.startDate).endOf('d').toISOString()),
              minDate: minDate(this.editedSlot.dates.startDate),
            }),
          },
        },
      },
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
      const slotsToPlanLength = this.course.slotsToPlan.length;
      const courseSlots = groupBy(this.course.slots.filter(slot => !!slot.startDate), s => formatDate(s.startDate));
      const slotList = Object.values(courseSlots);
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
    stepList () {
      return get(this.course, 'subProgram.steps').map(step => ({
        key: step._id,
        name: step.name,
        type: this.getStepTypeLabel(step.type),
      }));
    },
  },
  async created () {
    if (!this.course) this.$emit('refresh');
  },
  methods: {
    getDuration,
    formatIntervalHourly,
    formatDate,
    pick,
    omit,
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
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
        step: get(slot, 'step') || '',
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
    async addDateToPlan (stepId) {
      try {
        if (this.course.archivedAt) {
          return NotifyWarning('Vous ne pouvez pas ajouter un créneau à une formation archivée.');
        }

        this.addDateToPlanLoading = true;
        await CourseSlots.create({ course: this.course._id, step: stepId });
        NotifyPositive('Date à planifier ajoutée.');

        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la date à planifier.');
      } finally {
        this.addDateToPlanLoading = false;
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
        if (e.data.statusCode === 409) return NotifyWarning('Créneau émargé : impossible de le supprimer.');
        if (e.data.statusCode === 403) return NotifyWarning('Seul créneau de l\'étape : impossible de le supprimer.');
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
      set(this.editedCourseSlot, path, value);
    },
    async updateEstimatedStartDate (event) {
      this.$emit('update', set(this.course, 'estimatedStartDate', event));
    },
  },

};
</script>

<style lang="sass" scoped>
.slot-section-title
  padding: 0
  margin: 10px 0px
  &-subtitle
    font-style: italic
    font-size: 16px
    @media screen and (max-width: 767px)
      font-size: 13px

.type
  background-color: $copper-grey-100
  border-radius: 15px
  padding: 2px 6px
  width: fit-content

.defined
  background-color: $copper-100
  border-radius: 15px
  padding-bottom: 16px

.to-plan
  background-color: $orange-100
  border-radius: 15px
  padding-bottom: 16px

.to-plan-header
  background-color: $orange-200
  padding: 16px 8px
  border-radius: 15px 15px 0px 0px
  color: $orange-900

.index
  background-color: $copper-500
  border-radius: 50%
  width: 20px
  height: 20px
  padding: 0px 4px
  text-align: center
  color: white
  margin: 0px 4px

.slots-container
   @media screen and (min-width: 767px)
    margin-left: 32px
</style>
