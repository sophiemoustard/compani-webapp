<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        Ajouter une <span class="text-weight-bold">personne</span>
      </template>
      <ni-input in-modal :model-value="newTester.local.email" @update:model-value="update($event.trim(), 'local.email')"
        caption="Email" @blur="validations.local.email.$touch" :error-message="emailError(validations)"
        :error="validations.local.email.$error" required-field :last="firstStep" :disable="!firstStep" />
      <template v-if="!firstStep">
        <ni-input in-modal :model-value="newTester.identity.firstname" caption="Prénom"
          @update:model-value="update($event, 'identity.firstname')" />
        <ni-input in-modal :model-value="newTester.identity.lastname" required-field caption="Nom"
          @blur="validations.identity.lastname.$touch" :error="validations.identity.lastname.$error"
          @update:model-value="update($event, 'identity.lastname')" />
        <ni-input in-modal :model-value="newTester.contact.phone" last required-field caption="Téléphone"
          @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" @update:model-value="update($event.trim(), 'contact.phone')" />
      </template>
      <template #footer>
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="loading" icon-right="add" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" color="primary" label="Ajouter la personne"
          :loading="loading" icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { userMixin } from '@mixins/userMixin';
import set from 'lodash/set';

export default {
  name: 'TesterCreationModal',
  mixins: [userMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    newTester: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'next-step', 'submit', 'update:new-tester'],
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    nextStep () {
      this.$emit('next-step');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, path) {
      this.$emit('update:new-tester', set({ ...this.newTester }, path, event));
    },
  },
};
</script>
