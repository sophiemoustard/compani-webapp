<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">sous-programme</span>
    </template>
    <ni-input in-modal v-model.trim="newSubProgram.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <template slot="footer">
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
    newSubProgram: { type: Object, default: () => {} },
    validations: { type: Object, default: () => {} },
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
    submit () {
      this.$emit('submit');
    },
  },
}
</script>
