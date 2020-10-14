<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Éditer le <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedSurcharge.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="editedSurcharge.saturday"
        :error="validations.saturday.$error" @blur="validations.saturday.$touch"
        :error-message="nbrError('saturday', validations)" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="editedSurcharge.sunday"
        :error="validations.sunday.$error" @blur="validations.sunday.$touch"
        :error-message="nbrError('sunday', validations)" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" :error="validations.publicHoliday.$error"
        v-model="editedSurcharge.publicHoliday" type="number" @blur="validations.publicHoliday.$touch"
        :error-message="nbrError('publicHoliday', validations)" />
      <ni-input in-modal caption="Majoration 25 décembre" :error="validations.twentyFifthOfDecember.$error"
        v-model="editedSurcharge.twentyFifthOfDecember" @blur="validations.twentyFifthOfDecember.$touch"
        :error-message="nbrError('twentyFifthOfDecember', validations)" suffix="%" type="number" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="editedSurcharge.firstOfMay"
        :error="validations.firstOfMay.$error" @blur="validations.firstOfMay.$touch"
        :error-message="nbrError('firstOfMay', validations)" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="editedSurcharge.evening"
        :error="validations.evening.$error" @blur="validations.evening.$touch"
        :error-message="nbrError('evening', validations)" first-of-may />
      <ni-time-input in-modal v-model="editedSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.eveningStartTime.$error" @blur="validations.eveningStartTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.eveningEndTime.$error" @blur="validations.eveningEndTime.$touch"
        :disable="!editedSurcharge.evening" :required-field="!!editedSurcharge.evening"
        error-message="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="editedSurcharge.custom"
        :error="validations.custom.$error" @blur="validations.custom.$touch" />
      <ni-time-input in-modal v-model="editedSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.customStartTime.$error" @blur="validations.customStartTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.customEndTime.$error" @blur="validations.customEndTime.$touch"
        :disable="!editedSurcharge.custom" :required-field="!!editedSurcharge.custom" error-message="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le plan de majoration" icon-right="check"
          color="primary" :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import TimeInput from '@components/form/TimeInput';

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
  },
};
</script>
