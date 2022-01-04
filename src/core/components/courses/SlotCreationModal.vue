<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter un <span class="text-weight-bold">créneau</span>
    </template>
    <ni-select in-modal caption="Etape" :options="stepOptions" :model-value="newCourseSlot.step" required-field
      @blur="validations.step.$touch" :error="validations.step.$error" @update:model-value="updateStep" />
    <ni-datetime-range caption="Dates et heures" :model-value="newCourseSlot.dates" disable-end-date
      :error="validations.dates.$error" @blur="validations.dates.$touch" @update:model-value="update($event, 'dates')"
      required-field />
    <ni-search-address v-if="getType(this.newCourseSlot.step) === ON_SITE" error-message="'Adresse non valide'"
      :model-value="newCourseSlot.address" @update:model-value="update($event, 'address')"
      @blur="validations.address.$touch" :error="validations.address.$error" in-modal last />
    <ni-input v-if="getType(this.newCourseSlot.step) === REMOTE" in-modal :error="validations.meetingLink.$error"
      :model-value="newCourseSlot.meetingLink" @update:model-value="update($event, 'meetingLink')"
      :error-message="linkErrorMessage" caption="Lien vers la visio" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter un créneau" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Button from '@components/Button';
import DateTimeRange from '@components/form/DatetimeRange';
import SearchAddress from '@components/form/SearchAddress';
import { ON_SITE, REMOTE } from '@data/constants';

export default {
  name: 'SlotCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCourseSlot: { type: Object, default: () => ({}) },
    stepOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    linkErrorMessage: { type: String, default: '' },
  },
  components: {
    'ni-datetime-range': DateTimeRange,
    'ni-search-address': SearchAddress,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update'],
  data () {
    return { ON_SITE, REMOTE };
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (value, path) {
      this.$emit('update', { path, value });
    },
    getType (step) {
      return step ? this.stepOptions.find(option => option.value === step).type : '';
    },
    updateStep (step) {
      const type = this.getType(step);
      if (type !== REMOTE) this.update('', 'meetingLink');
      if (type !== ON_SITE) this.update({}, 'address');
      this.update(step, 'step');
    },
  },
};
</script>
