<template>
  <ni-modal :value="value" @hide="hide" @input="input" @show="show">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">fiche coach</span>
    </template>
    <ni-input :disable="!firstStep" in-modal :value="newCoach.local.email" :error="validations.local.email.$error"
      caption="Email" @blur="validations.local.email.$touch" :error-message="emailError" required-field
      @input="update($event.trim(), 'local.email')" />
    <ni-select :disable="!firstStep" in-modal caption="Role" :options="roleOptions" :value="newCoach.role"
      :error="validations.role.$error" @blur="validations.role.$touch" required-field @input="update($event, 'role')"
      :last="firstStep" />
    <template v-if="!firstStep">
      <ni-input :value="newCoach.identity.firstname" caption="Prénom" @input="update($event, 'identity.firstname')"
        in-modal />
      <ni-input in-modal :value="newCoach.identity.lastname" :error="validations.identity.lastname.$error" caption="Nom"
        required-field @blur="validations.identity.lastname.$touch" @input="update($event, 'identity.lastname')" />
      <ni-input in-modal :value="newCoach.contact.phone" :error="validations.contact.phone.$error" last
        caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError"
        @input="update($event.trim(), 'contact.phone')" />
    </template>
    <template slot="footer">
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" icon-right="add" color="primary"
        :loading="loading" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter la fiche" icon-right="add"
        color="primary" :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';

export default {
  name: 'CoachCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCoach: { type: Object, default: () => ({}) },
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
    update (event, path) {
      this.$emit('update:newCoach', set({ ...this.newCoach }, path, event));
    },
  },
};
</script>
