<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Éditer un <span class="text-weight-bold">utilisateur</span>
    </template>
    <ni-input in-modal :value="selectedUser.local.email" :error="validations.local.email.$error" caption="Email"
      @blur="validations.local.email.$touch" :error-message="emailError" @input="update($event, 'local.email')"
      required-field />
    <ni-select caption="Role" :options="roleOptions" :value="selectedUser.role" @blur="validations.role.$touch"
      :error="validations.role.$error" required-field @input="update($event, 'role')" in-modal />
    <ni-input in-modal :value="selectedUser.identity.firstname" @input="update($event, 'identity.firstname')"
      caption="Prénom" />
    <ni-input :value="selectedUser.identity.lastname" :error="validations.identity.lastname.$error" caption="Nom"
      @blur="validations.identity.lastname.$touch" required-field @input="update($event, 'identity.lastname')"
      in-modal />
    <ni-input in-modal :value="selectedUser.contact.phone" :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" last @input="update($event.trim(), 'contact.phone')"
      :error-message="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Éditer un utilisateur" icon-right="check" color="primary"
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
  name: 'UserEditionModal',
  props: {
    value: { type: Boolean, default: false },
    selectedUser: { type: Object, default: () => ({}) },
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
    update (event, fields) {
      this.$emit('update:selectedUser', set({ ...this.selectedUser }, fields, event));
    },
  },
};
</script>
