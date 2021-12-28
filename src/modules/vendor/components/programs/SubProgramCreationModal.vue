<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">sous-programme</span>
    </template>
    <ni-input in-modal :model-value="newSubProgram.name" :error="validations.name.$error" caption="Nom"
      @blur="validations.name.$touch" required-field @update:model-value="update($event.trim(), 'name')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer le sous-programme" color="primary"
        icon-right="add" @click="submit" :loading="loading" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'SubProgramCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newSubProgram: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'update:new-sub-program', 'submit'],
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
      this.$emit('update:new-sub-program', { ...this.newSubProgram, [prop]: event });
    },
  },
};
</script>
