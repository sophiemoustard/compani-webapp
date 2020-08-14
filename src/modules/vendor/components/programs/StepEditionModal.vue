<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Éditer une <span class="text-weight-bold">étape</span>
    </template>
    <ni-input in-modal v-model.trim="editedStep.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <template slot="footer">
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
    editedStep: { type: Object, default: () => {} },
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
