<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Nouvelle <span class="text-weight-bold">facture</span>
    </template>
    <div>{{ getCourseName }} </div>
    <div class="trainees">{{ getTraineesQuantity }} </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.payer" required-field
      @update:model-value="update($event, 'payer')" />
    <ni-input in-modal :caption="course.type === INTRA ? 'Prix du programme' : 'Prix par stagiaire'"
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
import { toRefs, computed } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import { INTRA } from '@data/constants';
import { formatQuantity } from '@helpers/utils';

export default {
  name: 'CourseBillCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newBill: { type: Object, default: () => ({}) },
    payerOptions: { type: Array, default: () => [] },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-bill'],
  setup (props, { emit }) {
    const { course, company } = toRefs(props);
    const getCourseName = computed(() => `${get(company, 'value.name')} - 
      ${get(course, 'value.subProgram.program.name')} ${get(course, 'value.misc')
  ? ` - 
      ${get(course, 'value.misc')}`
  : ''}`);

    const getTraineesQuantity = computed(() => {
      const traineesQuantity = get(course, 'value.trainees')
        .filter(trainee => trainee.company._id === company.value._id).length;

      return `${formatQuantity('stagiaire', traineesQuantity)} de ${get(company, 'value.name')}
        ${traineesQuantity > 1 ? 'inscrits' : 'inscrit'} à cette formation`;
    });

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => {
      emit('update:new-bill', set({ ...props.newBill }, path, event));
    };

    return {
      // Data
      INTRA,
      // Computed
      getCourseName,
      getTraineesQuantity,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>

<style lang="sass" scoped>
.trainees
  color: $copper-grey-500
  font-size: 14px
  margin-bottom: 16px
</style>
