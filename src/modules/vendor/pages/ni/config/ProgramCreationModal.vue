<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">programme</span>
    </template>
    <ni-input in-modal v-model.trim="newProgram.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le programme" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'ProgramCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newProgram: { type: Object, default: () => ({}) },
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
  },
};
</script>
