<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
        Modifier mon <span class="text-weight-bold">mot de passe</span>
      </template>
      <ni-input in-modal v-model.trim="userProfile.local.password" type="password" caption="Nouveau mot de passe"
        :error-message="passwordError" required-field @blur="validations.userProfile.local.password.$touch"
        :error="validations.userProfile.local.password.$error" />
      <ni-input in-modal :value="passwordConfirm" :error="validations.passwordConfirm.$error"
        type="password" caption="Confirmation mot de passe" :error-message="passwordConfirmError"
        @blur="validations.passwordConfirm.$touch" required-field @input="update" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Modifier" color="primary" :loading="loading"
          icon-right="done" @click="submit" />
      </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'NewPasswordModal',
  props: {
    validations: { type: Object, default: () => ({}) },
    userProfile: { type: Object, default: () => ({}) },
    passwordError: { type: String, default: '' },
    passwordConfirm: { type: String, default: '' },
    passwordConfirmError: { type: String, default: '' },
    value: { type: Boolean, default: false },
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
    submit () {
      this.$emit('submit');
    },
    update (event) {
      this.$emit('update:password-confirm', event.trim());
    },
  },
};
</script>
