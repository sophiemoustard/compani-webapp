<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
       Nouvelle <span class="text-weight-bold">note</span>
    </template>
    <ni-input in-modal :value="newCustomerNote.title" @input="update($event, 'title')" caption="Titre" required-field
      @blur="validations.title.$touch" :error="validations.title.$error" />
    <ni-input in-modal :value="newCustomerNote.description" @input="update($event, 'description')" type="textarea"
      @blur="validations.description.$touch" :error="validations.description.$error" caption="Description"
      required-field />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la note" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>

import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'CustomerNoteCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCustomerNote: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
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
    update (event, prop) {
      this.$emit('update:newCustomerNote', { ...this.newCustomerNote, [prop]: event });
    },
  },
};
</script>
