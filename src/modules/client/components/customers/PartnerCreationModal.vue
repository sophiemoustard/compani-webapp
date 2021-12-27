<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :model-value="newPartner.identity.firstname" caption="Prénom"
       @update:model-value="update($event.trim(), 'identity.firstname')" />
    <ni-input in-modal :model-value="newPartner.identity.lastname" @blur="validations.identity.lastname.$touch"
      @update:model-value="update($event.trim(), 'identity.lastname')" :error="validations.identity.lastname.$error"
       caption="Nom" required-field />
    <ni-input in-modal :model-value="newPartner.email" @update:model-value="update($event.trim(), 'email')"
      @blur="validations.email.$touch" :error="validations.email.$error" :error-message="emailError(validations)"
      caption="Email" />
    <ni-input :model-value="newPartner.phone" @update:model-value="update($event.trim(), 'phone')" caption="Téléphone"
      @blur="validations.phone.$touch" :error="validations.phone.$error" in-modal
      :error-message="phoneNumberError(validations)" />
    <ni-select in-modal :model-value="newPartner.job" @update:model-value="update($event, 'job')" caption="Fonction"
      :options="jobOptions" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la personne" icon-right="add" color="primary"
        @click="submit" :loading="loading" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { JOB_OPTIONS } from '@data/constants';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';

export default {
  name: 'PartnerCreationModal',
  mixins: [partnerOrganizationMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    newPartner: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-partner'],
  data () {
    return {
      jobOptions: JOB_OPTIONS,
    };
  },
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
    update (event, path) {
      this.$emit('update:new-partner', set({ ...this.newPartner }, path, event));
    },
  },
};
</script>
