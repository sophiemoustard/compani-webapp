<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
        Éditer une <span class="text-weight-bold">personne</span>
      </template>
      <ni-input in-modal :value="editedTrainee.local.email" caption="Email" disable />
      <ni-input in-modal :value="editedTrainee.identity.firstname" @input="update($event, 'identity.firstname')"
        caption="Prénom" />
      <ni-input in-modal :value="editedTrainee.identity.lastname" @input="update($event, 'identity.lastname')"
        :error="validations.identity.lastname.$error" caption="Nom" @blur="validations.identity.lastname.$touch"
        required-field />
      <ni-input in-modal :value="editedTrainee.contact.phone" @input="update($event.trim(), 'contact.phone')"
        caption="Téléphone" @blur="validations.contact.phone.$touch" required-field
        :error-message="phoneNbrError(validations)" :error="validations.contact.phone.$error" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Éditer la personne" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { userMixin } from '@mixins/userMixin';
import set from 'lodash/set';

export default {
  name: 'TraineeEditionModal',
  mixins: [userMixin],
  props: {
    value: { type: Boolean, default: false },
    editedTrainee: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
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
    update (event, path) {
      this.$emit('update:editedTrainee', set({ ...this.editedTrainee }, path, event));
    },
  },
};
</script>
