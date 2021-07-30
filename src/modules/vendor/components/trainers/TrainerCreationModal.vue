<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer une nouvelle<span class="text-weight-bold">fiche formateur</span>
    </template>
    <ni-input in-modal :value="newTrainer.local.email" @input="update($event.trim(), 'local.email')" required-field
      @blur="validations.local.email.$touch" caption="Email" :error="validations.local.email.$error"
      :error-message="emailError" :last="firstStep" :disable="!firstStep" />
    <template v-if="!firstStep">
      <ni-input in-modal :value="newTrainer.identity.firstname" @input="update($event.trim(), 'identity.firstname')"
        caption="Prénom" />
      <ni-input in-modal :value="newTrainer.identity.lastname" @input="update($event.trim(), 'identity.lastname')"
        :error="validations.identity.lastname.$error" @blur="validations.identity.lastname.$touch" required-field
        caption="Nom" last />
    </template>
    <template slot="footer">
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
        :loading="loading" icon-right="add" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Créer la fiche" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import set from 'lodash/set';

export default {
  name: 'TrainerCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newTrainer: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    emailError: { type: String, default: '' },
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
    goToNextStep () {
      this.$emit('go-to-next-step');
    },
    update (event, path) {
      this.$emit('update:newTrainer', set({ ...this.newTrainer }, path, event));
    },
  },
};
</script>
