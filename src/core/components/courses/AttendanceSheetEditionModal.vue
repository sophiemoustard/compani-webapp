<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Modifier la <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select :model-value="editedAttendanceSheet.trainee"
    :options="traineeIdentity" disable />
    <ni-option-group :model-value="editedAttendanceSheet.slots" in-modal required-field
      @update:model-value="update($event, 'slots')" type="checkbox" inline :options="editionSlotOptions" />
    <template #footer>
    <ni-button class="full-width modal-btn bg-primary" label="Modifier la feuille d'émargement" :loading="loading"
      icon-right="add" @click="submit" color="white" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Button from '@components/Button';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'AttendanceSheetEditionModal',
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
    'ni-button': Button,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    editedAttendanceSheet: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    editionSlotOptions: { type: Array, default: () => [] },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-attendance-sheet'],
  setup (props, { emit }) {
    const { editedAttendanceSheet } = toRefs(props);

    const traineeIdentity = computed(() => [
      { label: formatIdentity(editedAttendanceSheet.value.trainee.identity, 'FL'),
        value: editedAttendanceSheet.value.trainee },
    ]);

    const selectedSlots = computed(() => editedAttendanceSheet.value.slots.map(slot => slot._id));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (slotsValue, prop) => {
      emit(
        'update:edited-attendance-sheet',
        { ...editedAttendanceSheet.value, [prop]: slotsValue }
      );
    };

    return {
      // Computed
      traineeIdentity,
      selectedSlots,
      // Methods
      hide,
      input,
      submit,
      update,
      // formatIdentity,
    };
  },
};
</script>
