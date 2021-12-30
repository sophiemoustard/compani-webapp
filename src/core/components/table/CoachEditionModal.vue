<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :model-value="selectedCoach.local.email" :error="validations.local.email.$error" caption="Email"
      :error-message="emailError" @update:model-value="update($event, 'local.email')" required-field
      @blur="validations.local.email.$touch" />
    <ni-select caption="Role" :options="roleOptions" :model-value="selectedCoach.role" @blur="validations.role.$touch"
      :error="validations.role.$error" required-field @update:model-value="update($event, 'role')" in-modal />
    <ni-input in-modal :model-value="selectedCoach.identity.firstname" caption="Prénom"
      @update:model-value="update($event, 'identity.firstname')" />
    <ni-input :model-value="selectedCoach.identity.lastname" :error="validations.identity.lastname.$error" caption="Nom"
      @blur="validations.identity.lastname.$touch" @update:model-value="update($event, 'identity.lastname')"
      in-modal required-field />
    <ni-input in-modal :model-value="selectedCoach.contact.phone" :error="validations.contact.phone.$error"
      @blur="validations.contact.phone.$touch" @update:model-value="update($event.trim(), 'contact.phone')" last
      :error-message="phoneNbrError" caption="Téléphone" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Éditer la personne" icon-right="check" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';

export default {
  name: 'CoachEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    selectedCoach: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    roleOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    emailError: { type: String, default: '' },
    phoneNbrError: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:selected-coach'],
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
      this.$emit('update:selected-coach', set({ ...this.selectedCoach }, path, event));
    },
  },
};
</script>
