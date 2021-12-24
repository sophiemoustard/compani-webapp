<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Éditer le <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="editedSurcharge.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event, 'name')" />
      <ni-input in-modal caption="Majoration 1er janvier" @update:model-value="update($event, 'firstOfJanuary')"
        :model-value="editedSurcharge.firstOfJanuary" type="number" @blur="validations.firstOfJanuary.$touch" suffix="%"
        :error="validations.firstOfJanuary.$error" :error-message="nbrError('firstOfJanuary', validations)" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" :model-value="editedSurcharge.firstOfMay"
        :error="validations.firstOfMay.$error" @blur="validations.firstOfMay.$touch"
        :error-message="nbrError('firstOfMay', validations)" @update:model-value="update($event, 'firstOfMay')" />
      <ni-input in-modal caption="Majoration 25 décembre" :error="validations.twentyFifthOfDecember.$error"
        :model-value="editedSurcharge.twentyFifthOfDecember" @blur="validations.twentyFifthOfDecember.$touch"
        :error-message="nbrError('twentyFifthOfDecember', validations)" suffix="%" type="number"
        @update:model-value="update($event, 'twentyFifthOfDecember')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" :error="validations.publicHoliday.$error"
        :model-value="editedSurcharge.publicHoliday" type="number" @blur="validations.publicHoliday.$touch"
        :error-message="nbrError('publicHoliday', validations)" @update:model-value="update($event, 'publicHoliday')" />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" :model-value="editedSurcharge.saturday"
        :error="validations.saturday.$error" @update:model-value="update($event, 'saturday')"
        :error-message="nbrError('saturday', validations)" @blur="validations.saturday.$touch" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" :model-value="editedSurcharge.sunday"
        :error="validations.sunday.$error" @update:model-value="update($event, 'sunday')"
        :error-message="nbrError('sunday', validations)" @blur="validations.sunday.$touch" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" :model-value="editedSurcharge.evening"
        :error="validations.evening.$error" @update:model-value="update($event, 'evening')"
        :error-message="nbrError('evening', validations)" @blur="validations.evening.$touch" />
      <ni-time-input in-modal :model-value="editedSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.eveningStartTime.$error" @blur="validations.eveningStartTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" @update:model-value="update($event, 'eveningStartTime')" />
      <ni-time-input in-modal :model-value="editedSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.eveningEndTime.$error" @blur="validations.eveningEndTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" @update:model-value="update($event, 'eveningEndTime')" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" :model-value="editedSurcharge.custom"
        :error="validations.custom.$error" @update:model-value="update($event, 'custom')" type="number"
        @blur="validations.custom.$touch" />
      <ni-time-input in-modal :model-value="editedSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.customStartTime.$error" @blur="validations.customStartTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide"
        @update:model-value="update($event, 'customStartTime')" />
      <ni-time-input in-modal :model-value="editedSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.customEndTime.$error" @blur="validations.customEndTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide"
        @update:model-value="update($event, 'customEndTime')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Editer le plan de majoration" icon-right="check"
          color="primary" :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import TimeInput from '@components/form/TimeInput';
import { configMixin } from 'src/modules/client/mixins/configMixin';

export default {
  name: 'SurchargeEditionModal',
  mixins: [configMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    editedSurcharge: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-time-input': TimeInput,

  },
  emits: ['hide', 'update:model-value', 'submit', 'update:editedSurcharge'],
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
    update (event, prop) {
      this.$emit('update:editedSurcharge', { ...this.editedSurcharge, [prop]: event });
    },
  },
};
</script>
