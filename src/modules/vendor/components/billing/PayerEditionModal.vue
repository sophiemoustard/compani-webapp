<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Éditer le <span class="text-weight-bold">payeur</span>
    </template>
    <div class="course-bill-infos">
      <div>{{ courseName }} </div>
      <div>Facture pour le compte de {{ companiesName }}</div>
    </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="editedPayer" required-field
      @update:model-value="update" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Éditer le payeur" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';

export default {
  name: 'PayerEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedPayer: { type: String, default: () => '' },
    payerOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    courseName: { type: String, default: '' },
    companiesName: { type: String, default: '' },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-payer'],
  setup (props, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = event => emit('update:edited-payer', event);

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
