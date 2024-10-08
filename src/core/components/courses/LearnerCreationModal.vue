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
          @update:model-value="update($event, 'identity.firstname')" :disable="disableUserInfo" />
        <ni-input in-modal :model-value="newUser.identity.lastname" :error="validations.identity.lastname.$error"
          required-field @blur="validations.identity.lastname.$touch" caption="Nom"
          @update:model-value="update($event, 'identity.lastname')" :disable="disableUserInfo" />
        <ni-input in-modal :model-value="newUser.contact.phone" :required-field="!disableUserInfo"
          caption="Téléphone" @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" @update:model-value="update($event.trim(), 'contact.phone')"
          :disable="disableUserInfo" />
        <company-select in-modal :company-options="companyOptions" :company="newUser.company"
          @update="update($event.trim(), 'company')" required-field :validation="validations.company"
          :disable="disableCompany" />
        <ni-date-input caption="Date de rattachement" :model-value="newUser.userCompanyStartDate" in-modal last
          @update:model-value="update($event, 'userCompanyStartDate')" required
          :error="validations.userCompanyStartDate.$error" />
      </template>
      <template #footer>
        <ni-button v-if="firstStep" class="bg-primary full-width modal-btn" label="Suivant" color="white"
          :loading="loading" icon-right="add" @click="nextStep" />
        <ni-button v-else class="bg-primary full-width modal-btn" color="white" :label="secondStepFooterLabel"
          :loading="loading" icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import CompanySelect from '@components/form/CompanySelect';
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Button from '@components/Button';
import { userMixin } from '@mixins/userMixin';
import set from 'lodash/set';

export default {
  name: 'LearnerCreationModal',
  mixins: [userMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    disableCompany: { type: Boolean, default: false },
    disableUserInfo: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
    companyOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    learnerEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'company-select': CompanySelect,
    'ni-button': Button,
    'ni-date-input': DateInput,
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
