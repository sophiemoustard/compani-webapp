<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        Ajouter une <span class="text-weight-bold">structure</span>
      </template>
      <ni-select in-modal :model-value="selectedCompany" @update:model-value="update" caption="Structure"
        :options="companyOptions" required-field :error="validations.$error" />
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" label="Ajouter la structure" icon-right="add" color="white"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Button from '@components/Button';

export default {
  name: 'CompanyAdditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    selectedCompany: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:selected-company'],
  setup (_, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = event => emit('update:selected-company', event);

    return {
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
