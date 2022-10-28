<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer une <span class="text-weight-bold">étape</span>
    </template>
    <ni-input in-modal :model-value="editedStep.name" :error="validations.name.$error" caption="Nom"
      @update:model-value="update($event.trim(), 'name')" @blur="validations.name.$touch" required-field />
    <div class="row items-end">
      <ni-input in-modal caption="Durée théorique" type="number" :model-value="hours"
        :error="validations.theoreticalDuration.hours.$error" :error-message="theoreticalHoursErrorMsg" suffix="h"
        required-field @blur="validations.theoreticalDuration.hours.$touch"
        @update:model-value="updateTheoreticalDuration($event, 'hours')" class="flex-1 q-pr-sm" />
      <ni-input in-modal caption="" type="number" :model-value="minutes"
        :error="validations.theoreticalDuration.minutes.$error" :error-message="theoreticalMinutesErrorMsg" suffix="min"
        @blur="validations.theoreticalDuration.hours.$touch"
        @update:model-value="updateTheoreticalDuration($event, 'minutes')" class="flex-1 q-pl-sm" />
    </div>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Éditer l'étape" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { ref, toRefs, watch } from 'vue';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import CompaniDuration from '@helpers/dates/companiDurations';

export default {
  name: 'StepEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedStep: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    theoreticalHoursErrorMsg: { type: String, default: '' },
    theoreticalMinutesErrorMsg: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-step'],
  setup (props, { emit }) {
    const { editedStep } = toRefs(props);
    const hours = ref(null);
    const minutes = ref(null);

    watch(
      () => editedStep.value.theoreticalDuration,
      () => {
        if (editedStep.value.theoreticalDuration) {
          hours.value = CompaniDuration(editedStep.value.theoreticalDuration.hours).asHours();
          minutes.value = CompaniDuration(editedStep.value.theoreticalDuration.minutes).asMinutes();
        }
      }
    );

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => emit('update:edited-step', { ...editedStep.value, [path]: event });
    const updateTheoreticalDuration = (event, path) => {
      const value = path === 'hours' ? `PT${event || 0}H` : `PT${event || 0}M`;
      emit(
        'update:edited-step',
        set(editedStep.value, 'theoreticalDuration', { ...editedStep.value.theoreticalDuration, [path]: value })
      );
    };

    return {
      // Data
      hours,
      minutes,
      // Methods
      hide,
      input,
      submit,
      update,
      updateTheoreticalDuration,
    };
  },
};
</script>
