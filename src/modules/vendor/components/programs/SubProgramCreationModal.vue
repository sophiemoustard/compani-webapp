<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">sous-programme</span>
    </template>
    <ni-input in-modal :value="newSubProgram.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" @input="update($event.trim(), 'name')" />
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
    value: { type: Boolean, default: false },
    newSubProgram: { type: Object, default: () => ({}) },
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
      this.$emit('update:newSubProgram', { ...this.newSubProgram, [prop]: event });
    },
  },
};
</script>
