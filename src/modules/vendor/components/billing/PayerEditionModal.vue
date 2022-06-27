<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Éditer le <span class="text-weight-bold">payeur</span>
    </template>
    <div class="course-name">{{ getCourseName }} </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="editedPayer" required-field
      @update:model-value="update" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Éditer le payeur" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import get from 'lodash/get';
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
    course: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-payer'],
  setup (props, { emit }) {
    const { course, company } = toRefs(props);
    const getCourseName = computed(() => `${get(company, 'value.name')} - 
      ${get(course, 'value.subProgram.program.name')} ${get(course, 'value.misc')
  ? ` - 
      ${get(course, 'value.misc')}`
  : ''}`);

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = event => emit('update:edited-payer', event);

    return {
      // Computed
      getCourseName,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
