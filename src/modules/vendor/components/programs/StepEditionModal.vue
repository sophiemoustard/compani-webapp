<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Éditer une <span class="text-weight-bold">étape</span>
    </template>
    <ni-input in-modal :value="editedStep.name" :error="validations.name.$error" @input="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Nom" />
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
    value: { type: Boolean, default: false },
    editedStep: { type: Object, default: () => ({}) },
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
    update (event, prop) {
      this.$emit('update:editedStep', { ...this.editedStep, [prop]: event });
    },
  },
};
</script>
