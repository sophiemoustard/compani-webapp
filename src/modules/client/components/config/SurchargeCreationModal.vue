<template>
  <ni-modal :model-value="value" @hide="hide" @update:model-value="input">
      <template #title>
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newSurcharge.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event, 'name')" />
      <ni-input in-modal caption="Majoration 1er janvier" suffix="%" :model-value="newSurcharge.firstOfJanuary"
        :error="validations.firstOfJanuary.$error" @update:model-value="update($event, 'firstOfJanuary')" type="number"
        :error-message="nbrError('firstOfJanuary', validations)" @blur="validations.firstOfJanuary.$touch" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" :model-value="newSurcharge.firstOfMay"
        :error="validations.firstOfMay.$error" @blur="validations.firstOfMay.$touch"
        :error-message="nbrError('firstOfMay', validations)" @update:model-value="update($event, 'firstOfMay')" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        :model-value="newSurcharge.twentyFifthOfDecember" :error="validations.twentyFifthOfDecember.$error"
        :error-message="nbrError('twentyFifthOfDecember', validations)" @blur="validations.twentyFifthOfDecember.$touch"
        @update:model-value="update($event, 'twentyFifthOfDecember')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" :model-value="newSurcharge.publicHoliday"
        :error="validations.publicHoliday.$error" @blur="validations.publicHoliday.$touch" type="number"
        :error-message="nbrError('publicHoliday', validations)" @update:model-value="update($event, 'publicHoliday')" />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" :model-value="newSurcharge.saturday"
        :error="validations.saturday.$error" @update:model-value="update($event, 'saturday')"
        :error-message="nbrError('saturday', validations)" @blur="validations.saturday.$touch" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" :model-value="newSurcharge.sunday"
        :error="validations.sunday.$error" @update:model-value="update($event, 'sunday')"
        :error-message="nbrError('sunday', validations)" @blur="validations.sunday.$touch" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" :model-value="newSurcharge.evening"
        :error="validations.evening.$error" @blur="validations.evening.$touch"
        :error-message="nbrError('evening', validations)" @update:model-value="update($event, 'evening')" />
      <ni-time-input in-modal :model-value="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.eveningStartTime.$error" :disable="!newSurcharge.evening"
        @blur="validations.eveningStartTime.$touch" error-message="Heure invalide"
        :required-field="!!newSurcharge.evening" @update:model-value="update($event, 'eveningStartTime')" />
      <ni-time-input in-modal :model-value="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.eveningEndTime.$error" @blur="validations.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide"
        @update:model-value="update($event, 'eveningEndTime')" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" :model-value="newSurcharge.custom"
        :error="validations.custom.$error" @update:model-value="update($event, 'custom')"
        @blur="validations.custom.$touch" />
      <ni-time-input in-modal :model-value="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.customStartTime.$error" @blur="validations.customStartTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide"
        @update:model-value="update($event, 'customStartTime')" />
      <ni-time-input in-modal :model-value="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.customEndTime.$error" @blur="validations.customEndTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide"
        @update:model-value="update($event, 'customEndTime')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Créer le plan de majoration" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import TimeInput from '@components/form/TimeInput';
import { configMixin } from 'src/modules/client/mixins/configMixin';

export default {
  name: 'SurchargeCreationModal',
  mixins: [configMixin],
  props: {
    value: { type: Boolean, default: false },
    newSurcharge: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:newSurcharge'],
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-time-input': TimeInput,

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
    update (event, prop) {
      this.$emit('update:newSurcharge', { ...this.newSurcharge, [prop]: event });
    },
  },
};
</script>
