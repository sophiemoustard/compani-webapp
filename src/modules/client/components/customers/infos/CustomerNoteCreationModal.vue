<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
       Nouvelle <span class="text-weight-bold">note</span>
    </template>
    <ni-input in-modal :model-value="newNote.title" @update:model-value="update($event, 'title')" caption="Titre"
      @blur="validations.title.$touch" :error="validations.title.$error" required-field />
    <ni-input in-modal :model-value="newNote.description" @update:model-value="update($event, 'description')"
      @blur="validations.description.$touch" :error="validations.description.$error" caption="Description"
      required-field type="textarea" />
    <template #footer>
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
    modelValue: { type: Boolean, default: false },
    newNote: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:new-note'],
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
    update (event, prop) {
      this.$emit('update:new-note', { ...this.newNote, [prop]: event });
    },
  },
};
</script>
