<template>
  <ni-modal :value="value" @hide="hide" @input="input" @show="show">
    <template slot="title">
      Ajouter un <span class="text-weight-bold">utilisateur</span>
    </template>
    <ni-input :disable="!firstStep" in-modal v-model.trim="newUser.local.email" :error="validations.local.email.$error"
      caption="Email" @blur="validations.local.email.$touch" :error-message="emailError" required-field />
    <ni-select :disable="!firstStep" in-modal caption="Role" :options="roleOptions" v-model="newUser.role"
      :error="validations.role.$error" @blur="validations.role.$touch" :last="firstStep" required-field />
    <template v-if="!firstStep">
      <ni-input in-modal v-model="newUser.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="newUser.identity.lastname" :error="validations.identity.lastname.$error"
        caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="newUser.contact.phone" :error="validations.contact.phone.$error" last
        caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError" />
    </template>
    <template slot="footer">
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" icon-right="add" color="primary"
        :loading="loading" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter un utilisateur" icon-right="add"
        color="primary" :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';

export default {
  name: 'UserCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    roleOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: false },
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
    show () {
      this.$emit('show');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    goToNextStep () {
      this.$emit('go-to-next-step');
    },
  },
};
</script>
