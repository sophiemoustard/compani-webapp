<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">étape</span>
      </template>
      <ni-option-group inline caption="Type" :value="newStep.type" type="radio" :options="STEP_TYPES"
        required-field @input="update($event, 'type')" />
      <ni-input in-modal :value="newStep.name" :error="validations.name.$error" @input="update($event.trim(), 'name')"
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
import { STEP_TYPES } from '@data/constants';

export default {
  name: 'StepCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newStep: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      STEP_TYPES,
    };
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
      this.$emit('update:newStep', { ...this.newStep, [prop]: event });
    },
  },
};
</script>
