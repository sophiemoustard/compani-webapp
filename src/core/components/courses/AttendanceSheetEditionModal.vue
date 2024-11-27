<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Modifier la <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select :model-value="editedAttendanceSheet.trainee"
    :options="traineeIdentity" />
    <ni-option-group :model-value="selectedSlots" in-modal required-field
      @update:model-value="update($event, 'slots')" type="checkbox" inline :options="formattedSlotOptions" />
  </ni-modal>
</template>

<script>
import { toRefs, computed, ref } from 'vue';
import keyBy from 'lodash/keyBy';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { DD_MM_YYYY, HH_MM } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { ascendingSortBy } from '@helpers/dates/utils';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'AttendanceSheetEditionModal',
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    editedAttendanceSheet: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    notLinkedSlotOptions: { type: Array, default: () => [] },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-attendance-sheet'],
  setup (props, { emit }) {
    const { notLinkedSlotOptions, editedAttendanceSheet } = toRefs(props);

    const slotsOptions = ref([...notLinkedSlotOptions.value, ...editedAttendanceSheet.value.slots]);

    const formattedSlotOptions = computed(() => (
      [...slotsOptions.value]
        .sort(ascendingSortBy('startDate'))
        .map(s => ({
          label: `${CompaniDate(s.startDate).format(`${DD_MM_YYYY} ${HH_MM}`)}
          - ${CompaniDate(s.endDate).format(HH_MM)}`,
          value: s._id,
        }))
    ));

    const traineeIdentity = computed(() => [
      { label: formatIdentity(editedAttendanceSheet.value.trainee.identity, 'FL'),
        value: editedAttendanceSheet.value.trainee },
    ]);

    const selectedSlots = computed(() => editedAttendanceSheet.value.slots.map(slot => slot._id));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (slotsValue, prop) => {
      const slotsKeyById = keyBy(slotsOptions.value, '_id');
      const editedSlots = slotsValue.map(slotId => slotsKeyById[slotId]);

      emit(
        'update:edited-attendance-sheet',
        { ...editedAttendanceSheet.value, [prop]: editedSlots }
      );
    };

    return {
      // Computed
      formattedSlotOptions,
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
