<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        <div v-if="!learnerEdition">Ajouter une <span class="text-weight-bold">personne</span></div>
        <div v-else>Compte apprenant</div>
      </template>
      <ni-input in-modal :model-value="newUser.local.email" @update:model-value="update($event.trim(), 'local.email')"
        @blur="validations.local.email.$touch" caption="Email" :error-message="emailError(validations)"
        :error="validations.local.email.$error" required-field :last="firstStep" :disable="!firstStep" />
      <template v-if="!firstStep">
        <ni-input in-modal caption="Prénom" :model-value="newUser.identity.firstname"
          @update:model-value="update($event, 'identity.firstname')" />
        <ni-input in-modal :model-value="newUser.identity.lastname" :error="validations.identity.lastname.$error"
          required-field @blur="validations.identity.lastname.$touch" caption="Nom"
          @update:model-value="update($event, 'identity.lastname')" />
        <ni-input in-modal :model-value="newUser.contact.phone" :last="!displayCompany" required-field
          caption="Téléphone" @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" @update:model-value="update($event.trim(), 'contact.phone')" />
        <ni-select v-if="displayCompany" in-modal :options="companyOptions" :model-value="newUser.company"
          @update:model-value="update($event.trim(), 'company')" caption="Structure" last required-field
          @blur="validations.company.$touch" :error="validations.company.$error" :disable="disableCompany" />
      </template>
      <template #footer>
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="loading" icon-right="add" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" color="primary" :label="secondStepFooterLabel"
          :loading="loading" icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import { userMixin } from '@mixins/userMixin';
import set from 'lodash/set';

export default {
  name: 'LearnerCreationModal',
  mixins: [userMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    displayCompany: { type: Boolean, default: false },
    disableCompany: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
    companyOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    learnerEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  computed: {
    secondStepFooterLabel () {
      return this.learnerEdition ? 'Suivant' : 'Ajouter la personne';
    },
  },
  emits: ['hide', 'update:model-value', 'submit', 'next-step', 'update:new-user'],
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
      this.$emit('update:new-user', set({ ...this.newUser }, path, event));
    },
  },
};
</script>
