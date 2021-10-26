<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer une nouvelle <span class="text-weight-bold">structure</span>
    </template>
    <ni-input in-modal :value="newCompany.name" @input="update($event.trim(), 'name')" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Raison sociale" />
    <ni-option-group :value="newCompany.type" type="radio" :options-groups="[companyTypeOptions]" inline caption="Type"
      :error="validations.type.$error" required-field @input="update($event, 'type')" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la structure" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'CompanyCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCompany: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    companyTypeOptions: { type: Array, default: () => [] },
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
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newCompany', { ...this.newCompany, [prop]: event });
    },
  },
};
</script>
