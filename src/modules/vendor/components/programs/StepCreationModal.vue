<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">étape</span>
      </template>
      <ni-option-group inline caption="Type" v-model="newStep.type" type="radio" :options="stepTypeOptions"
        required-field />
      <ni-input in-modal v-model.trim="newStep.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field caption="Nom" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'étape" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'StepCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newStep: { type: Object, default: () => ({}) },
    stepTypeOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
