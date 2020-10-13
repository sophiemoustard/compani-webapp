<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSurcharge.name" :error="$v.newSurcharge.name.$error"
        @blur="$v.newSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="newSurcharge.saturday"
        :error="$v.newSurcharge.saturday.$error" @blur="$v.newSurcharge.saturday.$touch"
        :error-message="nbrError('newSurcharge.saturday')" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="newSurcharge.sunday"
        :error="$v.newSurcharge.sunday.$error" @blur="$v.newSurcharge.sunday.$touch"
        :error-message="nbrError('newSurcharge.sunday')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number" v-model="newSurcharge.publicHoliday"
        :error="$v.newSurcharge.publicHoliday.$error" @blur="$v.newSurcharge.publicHoliday.$touch"
        :error-message="nbrError('newSurcharge.publicHoliday')" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="newSurcharge.twentyFifthOfDecember" :error-message="nbrError('newSurcharge.twentyFifthOfDecember')"
        @blur="$v.newSurcharge.twentyFifthOfDecember.$touch" :error="$v.newSurcharge.twentyFifthOfDecember.$error" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="newSurcharge.firstOfMay"
        :error="$v.newSurcharge.firstOfMay.$error" @blur="$v.newSurcharge.firstOfMay.$touch"
        :error-message="nbrError('newSurcharge.firstOfMay')" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="newSurcharge.evening"
        :error="$v.newSurcharge.evening.$error" @blur="$v.newSurcharge.evening.$touch"
        :error-message="nbrError('newSurcharge.evening')" />
      <ni-time-input in-modal v-model="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="$v.newSurcharge.eveningStartTime.$error" @blur="$v.newSurcharge.eveningStartTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="$v.newSurcharge.eveningEndTime.$error" @blur="$v.newSurcharge.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :required-field="!!newSurcharge.evening" error-message="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.custom"
        :error="$v.newSurcharge.custom.$error" @blur="$v.newSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="$v.newSurcharge.customStartTime.$error" @blur="$v.newSurcharge.customStartTime.$touch"
        :disable="!newSurcharge.custom" :required-field="!!newSurcharge.custom" error-message="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="$v.newSurcharge.customEndTime.$error" @blur="$v.newSurcharge.customEndTime.$touch"
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
    // eslint-disable-next-line vue/prop-name-casing
    $v: { type: Object, default: () => ({}) },
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
