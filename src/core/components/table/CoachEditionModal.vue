<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Éditer une <span class="text-weight-bold">fiche</span>
    </template>
    <ni-input in-modal :value="selectedCoach.local.email" :error="validations.local.email.$error" caption="Email"
      @blur="validations.local.email.$touch" :error-message="emailError" @input="update($event, 'local.email')"
      required-field />
    <ni-select caption="Role" :options="roleOptions" :value="selectedCoach.role" @blur="validations.role.$touch"
      :error="validations.role.$error" required-field @input="update($event, 'role')" in-modal />
    <ni-input in-modal :value="selectedCoach.identity.firstname" @input="update($event, 'identity.firstname')"
      caption="Prénom" />
    <ni-input :value="selectedCoach.identity.lastname" :error="validations.identity.lastname.$error" caption="Nom"
      @blur="validations.identity.lastname.$touch" required-field @input="update($event, 'identity.lastname')"
      in-modal />
    <ni-input in-modal :value="selectedCoach.contact.phone" :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" last @input="update($event.trim(), 'contact.phone')"
      :error-message="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Éditer la fiche" icon-right="check" color="primary"
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
    value: { type: Boolean, default: false },
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
    update (event, path) {
      this.$emit('update:selectedCoach', set({ ...this.selectedCoach }, path, event));
    },
  },
};
</script>
