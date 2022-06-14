<template>
  <q-dialog :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <div class="modal-container-sm modal-padding in-modal">
      <div class="row justify-between">
        <div class="title q-mb-md">Annuler l'intervention</div>
        <q-icon class="cursor-pointer" name="close" size="1.5rem" @close="resetForm" v-close-popup />
      </div>
      <ni-option-group caption="Qui est à l'origine de l'annulation ?"
        :model-value="editedEvent.cancel.reason" type="radio" :options="cancellationReasons" required-field
        color="copper-500" @update:model-value="updateCancellationReason($event)" />
      <ni-option-group caption="Quelles sont les conditions d'annulation ?"
        :model-value="editedEvent.cancel.condition" type="radio" :options="cancellationOptions" required-field
        color="copper-500" @update:model-value="updateCancellationCondition($event)" />
      <ni-input in-modal type="textarea" :model-value="editedEvent.misc" caption="Notes" required-field last
        @update:model-value="updateEventMisc($event)" @blur="validations.misc.$touch"
        :error="validations.misc.$error" />
      <div class="row justify-end q-mb-md">
        <ni-button label="RETOUR" @click="resetForm" />
        <ni-button label="ANNULER L'INTERVENTION" @click="canCancelEvent" />
      </div>
    </div>
  </q-dialog>
</template>
<script>

import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { CANCELLATION_REASONS, CANCELLATION_OPTIONS } from '@data/constants';
import { formatDate, formatHoursWithMinutes } from '@helpers/date';
import { NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import Input from '@components/form/Input';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'EventCancellationModal',
  components: {
    'ni-button': Button,
    'ni-input': Input,
    'ni-option-group': OptionGroup,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    editedEvent: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    customerName: { type: String, default: '' },
  },
  emits: [
    'hide',
    'update:model-value',
    'update-event-misc',
    'update-cancellation-reason',
    'update-cancellation-condition',
    'cancel-event',
  ],
  setup (props, { emit }) {
    const $q = useQuasar();
    const cancellationReasons = ref(CANCELLATION_REASONS);
    const cancellationOptions = ref(CANCELLATION_OPTIONS);

    const hide = () => { emit('hide'); };

    const resetForm = () => {
      hide();
      emit('update-cancellation-reason', '');
      emit('update-cancellation-condition', '');
    };

    const updateEventMisc = (value) => { emit('update-event-misc', value); };

    const updateCancellationReason = (value) => { emit('update-cancellation-reason', value); };

    const updateCancellationCondition = (value) => { emit('update-cancellation-condition', value); };

    const formatDateAndHours = (startDate, endDate) => {
      const date = formatDate(startDate);
      return `${date} (${formatHoursWithMinutes(startDate)} - ${formatHoursWithMinutes(endDate)})`;
    };

    const cancelEvent = () => { emit('cancel-event'); };

    const canCancelEvent = () => {
      props.validations.$touch();
      if (props.validations.$error) return NotifyWarning('Champ(s) invalide(s)');

      $q.dialog({
        title: 'Confirmation',
        message: `Êtes-vous sûr(e) de vouloir annuler l'intervention du
          ${formatDateAndHours(props.editedEvent.dates.startDate, props.editedEvent.dates.endDate)}
          chez ${props.customerName}?`,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => cancelEvent())
        .onCancel(() => NotifyPositive('Annulation annulée.'));
    };

    return {
      // Data
      cancellationReasons,
      cancellationOptions,
      // Methods
      hide,
      resetForm,
      updateEventMisc,
      updateCancellationReason,
      updateCancellationCondition,
      canCancelEvent,
      cancelEvent,
    };
  },
};
</script>

<style lang="sass" scoped>
.title
  font-size: 20px
</style>
