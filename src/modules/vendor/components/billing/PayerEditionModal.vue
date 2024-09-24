<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Éditer le <span class="text-weight-bold">payeur</span>
    </template>
    <div class="course-bill-infos">
      <div>{{ courseName }} </div>
      <ni-banner class="bg-copper-grey-100 q-mt-sm" icon="info_outline">
        <template #message>Facture pour le compte de {{ companiesName }}</template>
      </ni-banner>
    </div>
    <company-select in-modal caption="Payeur" :company-options="payerOptions" :company="editedPayer" required-field
      @update="update" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Éditer le payeur" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Banner from '@components/Banner';
import CompanySelect from '@components/form/CompanySelect';

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
    'ni-banner': Banner,
    'company-select': CompanySelect,
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
