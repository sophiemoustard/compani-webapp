<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
        Ajouter une <span class="text-weight-bold">personne</span>
      </template>
      <ni-input in-modal :value="newTester.local.email" @input="update($event.trim(), 'local.email')" caption="Email"
        @blur="validations.local.email.$touch" :error-message="emailError(validations)"
        :error="validations.local.email.$error" required-field :last="firstStep" :disable="!firstStep" />
      <template v-if="!firstStep">
        <ni-input in-modal :value="newTester.identity.firstname" @input="update($event, 'identity.firstname')"
          caption="Prénom" />
        <ni-input in-modal :value="newTester.identity.lastname" @input="update($event, 'identity.lastname')"
          required-field @blur="validations.identity.lastname.$touch" caption="Nom"
          :error="validations.identity.lastname.$error" />
        <ni-input in-modal :value="newTester.contact.phone" @input="update($event.trim(), 'contact.phone')"
          caption="Téléphone" @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" last required-field />
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
    value: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    newTester: { type: Object, default: () => ({}) },
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
    nextStep () {
      this.$emit('next-step');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, path) {
      this.$emit('update:newTester', set({ ...this.newTester }, path, event));
    },
  },
};
</script>
