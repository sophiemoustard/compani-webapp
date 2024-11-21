<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-select :options="traineeFilterOptions" :model-value="newTraineeAttendance.trainee"
      @update:model-value="update($event, 'trainee')" caption="Participant·e" in-modal
      :error="validation.trainee.$error" :error-message="REQUIRED_LABEL" required-field />
    <div class="row q-pb-md">
      <ni-option-group :model-value="newTraineeAttendance.attendances" :error-message="REQUIRED_LABEL" required-field
        :options="slotsOptions" :error="validation.attendances.$error" type="checkbox" inline
        caption="Selectionner les créneaux auxquels a été présent·e le/la participant·e"
        @update:model-value="update($event, 'attendances')" />
    </div>
    <template #footer>
      <ni-button class="bg-primary full-width modal-btn" label="Ajouter la personne" color="white" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { REQUIRED_LABEL, HH_MM, DD_MM_YYYY } from '@data/constants';
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
  setup (props, { emit }) {
    const { course, newTraineeAttendance } = toRefs(props);

    const slotsOptions = computed(() => course.value.slots.map(s => ({
      label: `${CompaniDate(s.startDate).format(`${DD_MM_YYYY} ${HH_MM}`)} - ${CompaniDate(s.endDate).format(HH_MM)}`,
      value: s._id,
    })));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const update = (event, path) => {
      emit('update:new-trainee-attendance', set({ ...newTraineeAttendance.value }, path, event));
    };

    const submit = () => emit('submit');

    return {
      // Data
      REQUIRED_LABEL,
      // Computed
      slotsOptions,
      // Methods
      hide,
      input,
      update,
      submit,
    };
  },
};
</script>
