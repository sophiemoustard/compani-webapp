<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSurcharge.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="newSurcharge.saturday"
        :error="validations.saturday.$error" @blur="validations.saturday.$touch"
        :error-message="nbrError('newSurcharge.saturday')" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="newSurcharge.sunday"
        :error="validations.sunday.$error" @blur="validations.sunday.$touch"
        :error-message="nbrError('newSurcharge.sunday')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number" v-model="newSurcharge.publicHoliday"
        :error="validations.publicHoliday.$error" @blur="validations.publicHoliday.$touch"
        :error-message="nbrError('newSurcharge.publicHoliday')" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="newSurcharge.twentyFifthOfDecember" :error-message="nbrError('newSurcharge.twentyFifthOfDecember')"
        @blur="validations.twentyFifthOfDecember.$touch" :error="validations.twentyFifthOfDecember.$error" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="newSurcharge.firstOfMay"
        :error="validations.firstOfMay.$error" @blur="validations.firstOfMay.$touch"
        :error-message="nbrError('newSurcharge.firstOfMay')" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="newSurcharge.evening"
        :error="validations.evening.$error" @blur="validations.evening.$touch"
        :error-message="nbrError('newSurcharge.evening')" />
      <ni-time-input in-modal v-model="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="validations.eveningStartTime.$error" @blur="validations.eveningStartTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="validations.eveningEndTime.$error" @blur="validations.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.custom"
        :error="validations.custom.$error" @blur="validations.custom.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="validations.customStartTime.$error" @blur="validations.customStartTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="validations.customEndTime.$error" @blur="validations.customEndTime.$touch"
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
