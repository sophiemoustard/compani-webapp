<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :model-value="newTrainer.local.email" @update:model-value="update($event.trim(), 'local.email')"
      @blur="validations.local.email.$touch" caption="Email" :error="validations.local.email.$error"
      :error-message="emailError" :last="firstStep" :disable="!firstStep" />
    <template v-if="!firstStep">
      <ni-input in-modal :model-value="newTrainer.identity.firstname" caption="Prénom"
        @update:model-value="update($event.trim(), 'identity.firstname')" />
      <ni-input in-modal :model-value="newTrainer.identity.lastname" @blur="validations.identity.lastname.$touch"
        @update:model-value="update($event.trim(), 'identity.lastname')" :error="validations.identity.lastname.$error"
        required-field caption="Nom" last />
    </template>
    <template #footer>
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
        :loading="loading" icon-right="add" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter la personne" color="primary"
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['update:model-value', 'hide', 'submit', 'go-to-next-step', 'update:new-trainer'],
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
    goToNextStep () {
      this.$emit('go-to-next-step');
    },
    update (event, path) {
      this.$emit('update:new-trainer', set({ ...this.newTrainer }, path, event));
    },
  },
};
</script>
