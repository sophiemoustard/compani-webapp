<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Editer une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :model-value="editedPartner.identity.firstname" caption="Prénom"
      @update:model-value="update($event.trim(), 'identity.firstname')" />
    <ni-input in-modal :model-value="editedPartner.identity.lastname" @blur="validations.identity.lastname.$touch"
      @update:model-value="update($event.trim(), 'identity.lastname')" :error="validations.identity.lastname.$error"
      required-field caption="Nom" />
    <ni-input in-modal :model-value="editedPartner.email" @update:model-value="update($event.trim(), 'email')"
      @blur="validations.email.$touch" :error="validations.email.$error" :error-message="emailError(validations)"
       caption="Email" />
    <ni-input in-modal :model-value="editedPartner.phone" @update:model-value="update($event.trim(), 'phone')"
      @blur="validations.phone.$touch" :error="validations.phone.$error" caption="Téléphone"
      :error-message="phoneNumberError(validations)" />
    <ni-select in-modal :model-value="editedPartner.job" @update:model-value="update($event, 'job')" caption="Fonction"
      :options="jobOptions" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Editer la personne" icon-right="add" color="primary"
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
    editedPartner: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-partner'],
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
      this.$emit('update:edited-partner', set({ ...this.editedPartner }, path, event));
    },
  },
};
</script>
