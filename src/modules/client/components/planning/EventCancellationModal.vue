<template>
  <q-dialog :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <div class="modal-container-sm modal-padding in-modal">
      <div class="title q-mb-md">Annuler l'intervention</div>
      <ni-option-group caption="Qui est à l'origine de l'annulation ?"
        :model-value="editedEvent.cancel.reason" type="radio" :options="cancellationReasons" required-field
        color="copper-500" @update:model-value="updateEventReason($event)" />
      <ni-option-group caption="Quelles sont les conditions d'annulation ?"
        :model-value="editedEvent.cancel.condition" type="radio" :options="cancellationOptions" required-field
        color="copper-500" @update:model-value="updateEventCondition($event)" />
      <ni-input in-modal type="textarea" :model-value="editedEvent.misc" caption="Notes" required-field last
        @update:model-value="updateEventMisc($event)" @blur="validations.misc.$touch"
        :error="validations.misc.$error" />
      <div class="row justify-end q-mb-md">
        <ni-button label="RETOUR" @click="hide" />
        <ni-button label="ANNULER L'INTERVENTION" @click="canCancelEvent" />
      </div>
    </div>
  </q-dialog>
</template>
<script>

import get from 'lodash/get';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { CANCELLATION_REASONS, CUSTOMER_INITIATIVE, CANCELLATION_OPTIONS } from '@data/constants';
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
  },
  emits: [
    'hide',
    'update:model-value',
    'update-event-misc',
    'update-event-reason',
    'update-event-condition',
    'cancel-event',
  ],
  setup (props, { emit }) {
    const $q = useQuasar();
    const cancellationReasons = ref(CANCELLATION_REASONS);
    const cancellationOptions = ref(CANCELLATION_OPTIONS);
    const reason = get(props.editedEvent, 'cancel.reason') || CUSTOMER_INITIATIVE;
    const condition = get(props.editedEvent, 'cancel.condition');

    const hide = () => { emit('hide'); };
    const updateEventMisc = (value) => { emit('update-event-misc', value); };
    const updateEventReason = (value) => { emit('update-event-reason', value); };
    const updateEventCondition = (value) => { emit('update-event-condition', value); };

    const cancelEvent = () => { emit('cancel-event'); };

    const canCancelEvent = () => {
      props.validations.$touch();
      if (props.validations.$error) return NotifyWarning('Champ(s) invalide(s)');

      $q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir annuler l\'intervention  ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => cancelEvent())
        .onCancel(() => NotifyPositive('Annulation annulée.'));
    };

    return {
      cancellationReasons,
      cancellationOptions,
      reason,
      condition,
      hide,
      updateEventMisc,
      updateEventReason,
      updateEventCondition,
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
