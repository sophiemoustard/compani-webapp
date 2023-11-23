<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Nouvelle <span class="text-weight-bold">facture</span>
    </template>
    <div>{{ courseName }} </div>
    <div class="course-bill-infos">
      <ni-banner class="bg-copper-grey-100" icon="info_outline">
        <template #message>Facture pour le compte de {{ companiesName }}</template>
      </ni-banner>
      <div>{{ traineesQuantity }} </div>
    </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.payer" required-field
      @update:model-value="update($event, 'payer')" :error="validations.payer.$error" />
    <ni-input in-modal :caption="courseType === INTRA ? 'Prix du programme' : 'Prix par stagiaire'"
      :error="validations.mainFee.price.$error" type="number" :model-value="newBill.mainFee.price"
      @blur="validations.mainFee.price.$touch" suffix="€" required-field :error-message="errorMessages.price"
      @update:model-value="update($event, 'mainFee.price')" />
    <ni-input in-modal caption="Quantité" :error="validations.mainFee.count.$error" type="number"
      :model-value="newBill.mainFee.count" @blur="validations.mainFee.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'mainFee.count')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Créer la facture" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import Banner from '@components/Banner';
import { INTRA } from '@data/constants';

export default {
  name: 'CourseBillCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newBill: { type: Object, default: () => ({}) },
    payerOptions: { type: Array, default: () => [] },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    courseName: { type: String, default: '' },
    courseType: { type: String, default: '' },
    traineesQuantity: { type: String, default: '' },
    companiesName: { type: String, default: '' },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
    'ni-banner': Banner,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-bill'],
  setup (props, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => {
      emit('update:new-bill', set({ ...props.newBill }, path, event));
    };

    return {
      // Data
      INTRA,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
