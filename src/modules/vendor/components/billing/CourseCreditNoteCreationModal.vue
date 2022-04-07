<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Créer un <span class="text-weight-bold">avoir</span>
    </template>
    <ni-date-input in-modal caption="Date" :model-value="newCreditNote.date" @blur="validations.date.$touch"
      required-field :error="validations.date.$error" @update:model-value="update($event, 'date')" />
    <ni-input in-modal caption="Motif" :model-value="newCreditNote.misc" @update:model-value="update($event, 'misc')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Créer l'avoir" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import DateInput from '@components/form/DateInput';
import set from 'lodash/set';

export default {
  name: 'CourseCreditNoteCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCreditNote: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-credit-note'],
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
      this.$emit('update:new-credit-note', set({ ...this.newCreditNote }, path, event));
    },
  },
};
</script>
