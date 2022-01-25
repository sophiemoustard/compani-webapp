<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer une <span class="text-weight-bold">étape</span>
    </template>
    <ni-input in-modal :model-value="editedStep.name" :error="validations.name.$error" caption="Nom"
      @update:model-value="update($event.trim(), 'name')" @blur="validations.name.$touch" required-field />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Éditer l'étape" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'StepEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedStep: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-step'],
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
      this.$emit('update:edited-step', { ...this.editedStep, [prop]: event });
    },
  },
};
</script>
