<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        Éditer une <span class="text-weight-bold">personne</span>
      </template>
      <ni-input in-modal caption="Email" :model-value="editedTrainee.local.email" disable />
      <ni-input in-modal caption="Prénom" :model-value="editedTrainee.identity.firstname"
        @update:model-value="update($event, 'identity.firstname')" />
      <ni-input in-modal caption="Nom" :model-value="editedTrainee.identity.lastname"
        :error="validations.identity.lastname.$error" @blur="validations.identity.lastname.$touch"
        required-field @update:model-value="update($event, 'identity.lastname')" />
      <ni-input in-modal caption="Téléphone" :model-value="editedTrainee.contact.phone"
        @blur="validations.contact.phone.$touch" @update:model-value="update($event.trim(), 'contact.phone')"
        :error-message="phoneNbrError(validations)" :error="validations.contact.phone.$error" required-field />
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" label="Éditer la personne" icon-right="add" color="white"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { userMixin } from '@mixins/userMixin';
import set from 'lodash/set';

export default {
  name: 'TraineeEditionModal',
  mixins: [userMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    editedTrainee: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-trainee'],
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
      this.$emit('update:edited-trainee', set({ ...this.editedTrainee }, path, event));
    },
  },
};
</script>
