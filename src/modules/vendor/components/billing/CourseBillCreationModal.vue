<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Nouvelle <span class="text-weight-bold">facture</span>
    </template>
    <div>{{ courseName }} </div>
    <div class="course-bill-infos">
      <ni-banner class="bg-copper-grey-100 q-mt-sm" icon="info_outline">
        <template #message>Facture pour le compte de {{ companiesName }}</template>
      </ni-banner>
      <div v-if="course.type === INTRA">{{ traineesQuantityInfos }} </div>
    </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.payer" required-field
      @update:model-value="update($event, 'payer')" :error="validations.payer.$error" />
    <ni-option-group v-if="course.type !== INTRA" in-modal :model-value="newBill.mainFee.countUnit"
      :options="countUnitOptions" type="radio" @update:model-value="update($event, 'mainFee.countUnit')"
      :error="validations.mainFee.countUnit.$error" caption="Unité" inline required-field />
    <ni-input in-modal :caption="priceCaption" :error="validations.mainFee.price.$error" type="number"
      :model-value="newBill.mainFee.price" @blur="validations.mainFee.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'mainFee.price')" />
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
import { computed, toRefs } from 'vue';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import OptionGroup from '@components/form/OptionGroup';
import Button from '@components/Button';
import Select from '@components/form/Select';
import Banner from '@components/Banner';
import { INTRA, TRAINEE, GROUP } from '@data/constants';
import { formatQuantity, formatName } from '@helpers/utils';

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
    course: { type: Object, default: () => ({}) },
    traineesQuantity: { type: Number, default: 1 },
    companiesToBill: { type: Array, default: () => [] },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
    'ni-banner': Banner,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-bill'],
  setup (props, { emit }) {
    const { newBill, traineesQuantity, course, companiesToBill } = toRefs(props);

    const priceCaption = computed(() => (
      newBill.value.mainFee.countUnit === GROUP
        ? 'Prix du groupe'
        : 'Prix par stagiaire'
    ));

    const companiesName = computed(() => {
      const companies = course.value.companies.filter(c => companiesToBill.value.includes(c._id));
      return formatName(companies);
    });

    const traineesQuantityInfos = computed(() => `${formatQuantity('stagiaire', traineesQuantity.value)}
      ${companiesToBill.value.length > 1 ? 'des structures sélectionnées' : 'de la structure'}
      ${formatQuantity('inscrit', traineesQuantity.value, 's', false)} à cette formation`);

    const countUnitOptions = computed(() => [
      { label: 'Groupe', value: GROUP },
      { label: `Stagiaire (${formatQuantity('inscrit', traineesQuantity.value)} à cette formation)`, value: TRAINEE },
    ]);

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => {
      emit('update:new-bill', set({ ...newBill.value }, path, event));
      if (event === TRAINEE) {
        emit('update:new-bill', set({ ...newBill.value }, 'mainFee.count', traineesQuantity.value));
      } else if (event === GROUP) emit('update:new-bill', set({ ...newBill.value }, 'mainFee.count', 1));
    };

    return {
      // Data
      INTRA,
      // Computed
      countUnitOptions,
      priceCaption,
      traineesQuantityInfos,
      companiesName,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
