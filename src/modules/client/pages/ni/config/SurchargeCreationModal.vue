<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSurcharge.name" :error="validations.newSurcharge.name.$error"
        @blur="validations.newSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="newSurcharge.saturday"
        :error="validations.newSurcharge.saturday.$error" @blur="validations.newSurcharge.saturday.$touch"
        :error-message="nbrError('newSurcharge.saturday', validations)" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="newSurcharge.sunday"
        :error="validations.newSurcharge.sunday.$error" @blur="validations.newSurcharge.sunday.$touch"
        :error-message="nbrError('newSurcharge.sunday', validations)" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number" v-model="newSurcharge.publicHoliday"
        :error="validations.newSurcharge.publicHoliday.$error" @blur="validations.newSurcharge.publicHoliday.$touch"
        :error-message="nbrError('newSurcharge.publicHoliday', validations)" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="newSurcharge.twentyFifthOfDecember" :error="validations.newSurcharge.twentyFifthOfDecember.$error"
        :error-message="nbrError('newSurcharge.twentyFifthOfDecember', validations)"
        @blur="validations.newSurcharge.twentyFifthOfDecember.$touch" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="newSurcharge.firstOfMay"
        :error="validations.newSurcharge.firstOfMay.$error" @blur="validations.newSurcharge.firstOfMay.$touch"
        :error-message="nbrError('newSurcharge.firstOfMay', validations)" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="newSurcharge.evening"
        :error="validations.newSurcharge.evening.$error" @blur="validations.newSurcharge.evening.$touch"
        :error-message="nbrError('newSurcharge.evening', validations)" />
      <ni-time-input in-modal v-model="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.newSurcharge.eveningStartTime.$error" :disable="!newSurcharge.evening"
        @blur="validations.newSurcharge.eveningStartTime.$touch" error-message="Heure invalide"
        :required-field="!!newSurcharge.evening" />
      <ni-time-input in-modal v-model="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.newSurcharge.eveningEndTime.$error" @blur="validations.newSurcharge.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.custom"
        :error="validations.newSurcharge.custom.$error" @blur="validations.newSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.newSurcharge.customStartTime.$error" @blur="validations.newSurcharge.customStartTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.newSurcharge.customEndTime.$error" @blur="validations.newSurcharge.customEndTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le plan de majoration" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import TimeInput from '@components/form/TimeInput';

export default {
  name: 'SurchargeCreationModal',
  mixins: [configMixin],
  props: {
    value: { type: Boolean, default: false },
    newSurcharge: { type: Object, default: () => ({}) },
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
