<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-select :options="traineeFilterOptions" :model-value="newTraineeAttendance.trainee"
      @update:model-value="update($event, 'trainee')" caption="Participant(e)" in-modal
      :error="validation.trainee.$error" :error-message="REQUIRED_LABEL" required-field />
    <div class="row q-pb-md">
      <ni-option-group :model-value="newTraineeAttendance.attendances" :error-message="REQUIRED_LABEL" required-field
        :options="slotsOptions" :error="validation.attendances.$error" type="checkbox" inline
        caption="Selectionner les créneaux auxquels a été présent(e) le/la participant(e)"
        @update:model-value="update($event, 'attendances')" />
    </div>
    <template #footer>
      <ni-button class="bg-primary full-width modal-btn" label="Ajouter la personne" color="white" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { REQUIRED_LABEL } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'TraineeAttendanceCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    trainees: { type: Array, default: () => [] },
    traineeFilterOptions: { type: Array, default: () => [] },
    newTraineeAttendance: { type: Object, default: () => ({}) },
    validation: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-select': Select,
    'ni-button': Button,
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'update:new-trainee-attendance', 'submit'],
  data () {
    return {
      REQUIRED_LABEL,
    };
  },
  computed: {
    slotsOptions () {
      return this.course.slots.map(s => ({
        label: `${CompaniDate(s.startDate).format('dd/LL/yyyy T')} - ${CompaniDate(s.endDate).format('T')}`,
        value: s._id,
      }));
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    update (event, path) {
      this.$emit('update:new-trainee-attendance', set({ ...this.newTraineeAttendance }, path, event));
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
