<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Confirmation
    </template>
    <div class="course-name">{{ getCourseName }} </div>
    <ni-banner v-if="!traineesLength && course.type === INTER_B2B" icon="info_outline" icon-color="orange-700"
      class="bg-orange-50 text-orange-900">
      <template #message>Aucun stagiaire de la structure n'est inscrit à la formation</template>
    </ni-banner>
   <ni-date-input caption="Date de facture" :model-value="billToValidate.billedAt" :error="validations.billedAt.$error"
      @blur="validations.billedAt.$touch" in-modal required-field @update:model-value="update($event, 'billedAt')" />
    <template #footer>
      <div class="q-pl-lg">Cette opération est définitive. Confirmez-vous ?</div>
      <div class="row justify-end q-ma-md">
        <ni-button label="NON" :loading="loading" @click="cancel" />
        <ni-button label="OUI" :loading="loading" @click="submit" />
      </div>
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Banner from '@components/Banner';
import Button from '@components/Button';
import DateInput from '@components/form/DateInput';
import { INTER_B2B } from '@data/constants';

export default {
  name: 'CourseBillValidationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    billToValidate: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    traineesLength: { type: Number, default: 0 },
    course: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-date-input': DateInput,
    'ni-banner': Banner,
  },
  emits: ['hide', 'update:model-value', 'submit', 'cancel', 'update:bill-to-validate'],
  setup (props, { emit }) {
    const { course, company } = toRefs(props);

    const getCourseName = computed(() => `${get(company, 'value.name')} - 
      ${get(course, 'value.subProgram.program.name')} ${get(course, 'value.misc')
  ? ` - 
      ${get(course, 'value.misc')}`
  : ''}`);

    const hide = () => { emit('hide'); };
    const input = (event) => { emit('update:model-value', event); };
    const submit = () => { emit('submit'); };
    const cancel = () => { emit('cancel'); };
    const update = (event, path) => {
      emit('update:bill-to-validate', set({ ...props.billToValidate }, path, event));
    };

    return {
      // Data
      INTER_B2B,
      // Computed
      getCourseName,
      // Methods
      hide,
      input,
      submit,
      cancel,
      update,
    };
  },
};
</script>

<style lang="sass" scoped>
.banner
  background-color: $orange-50
  color: $orange-900
</style>
