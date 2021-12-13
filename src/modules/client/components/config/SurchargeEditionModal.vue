<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Éditer le <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" :value="editedSurcharge.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @input="update($event, 'name')" />
      <ni-input in-modal caption="Majoration 1er janvier" suffix="%" @input="update($event, 'firstOfJanuary')"
        :value="editedSurcharge.firstOfJanuary" type="number" @blur="validations.firstOfJanuary.$touch"
        :error="validations.firstOfJanuary.$error" :error-message="nbrError('firstOfJanuary', validations)" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" :value="editedSurcharge.firstOfMay"
        :error="validations.firstOfMay.$error" @blur="validations.firstOfMay.$touch"
        :error-message="nbrError('firstOfMay', validations)" @input="update($event, 'firstOfMay')" />
      <ni-input in-modal caption="Majoration 25 décembre" :error="validations.twentyFifthOfDecember.$error"
        :value="editedSurcharge.twentyFifthOfDecember" @blur="validations.twentyFifthOfDecember.$touch"
        :error-message="nbrError('twentyFifthOfDecember', validations)" suffix="%" type="number"
        @input="update($event, 'twentyFifthOfDecember')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" :error="validations.publicHoliday.$error"
        :value="editedSurcharge.publicHoliday" type="number" @blur="validations.publicHoliday.$touch"
        :error-message="nbrError('publicHoliday', validations)" @input="update($event, 'publicHoliday')" />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" :value="editedSurcharge.saturday"
        :error="validations.saturday.$error" @blur="validations.saturday.$touch" @input="update($event, 'saturday')"
        :error-message="nbrError('saturday', validations)" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" :value="editedSurcharge.sunday"
        :error="validations.sunday.$error" @blur="validations.sunday.$touch" @input="update($event, 'sunday')"
        :error-message="nbrError('sunday', validations)" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" :value="editedSurcharge.evening"
        :error="validations.evening.$error" @blur="validations.evening.$touch" @input="update($event, 'evening')"
        :error-message="nbrError('evening', validations)" first-of-may />
      <ni-time-input in-modal :value="editedSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.eveningStartTime.$error" @blur="validations.eveningStartTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" @input="update($event, 'eveningStartTime')" />
      <ni-time-input in-modal :value="editedSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.eveningEndTime.$error" @blur="validations.eveningEndTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" @input="update($event, 'eveningEndTime')" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" :value="editedSurcharge.custom"
        :error="validations.custom.$error" @blur="validations.custom.$touch" @input="update($event, 'custom')" />
      <ni-time-input in-modal :value="editedSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.customStartTime.$error" @blur="validations.customStartTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide"
        @input="update($event, 'customStartTime')" />
      <ni-time-input in-modal :value="editedSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.customEndTime.$error" @blur="validations.customEndTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide"
        @input="update($event, 'customEndTime')" />
      <template slot="footer">
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
    value: { type: Boolean, default: false },
    editedSurcharge: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
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
      this.$emit('input', event);
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
