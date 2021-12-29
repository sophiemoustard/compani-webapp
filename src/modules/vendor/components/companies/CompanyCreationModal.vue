<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">structure</span>
    </template>
    <ni-input in-modal :model-value="newCompany.name" @update:model-value="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Raison sociale" :error="validations.name.$error" />
    <ni-option-group :model-value="newCompany.type" type="radio" :options="companyTypeOptions" inline caption="Type"
      :error="validations.type.$error" required-field @update:model-value="update($event, 'type')" />
    <template #footer>
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['hide', 'update:model-value', 'submit', 'update:new-company'],
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
      this.$emit('update:new-company', { ...this.newCompany, [prop]: event });
    },
  },
};
</script>
