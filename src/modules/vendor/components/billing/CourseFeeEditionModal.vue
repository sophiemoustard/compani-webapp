<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <span class="text-weight-bold">{{ title }}</span>
    </template>
    <div class="course-name">{{ getCourseName }} </div>
    <ni-input in-modal caption="Prix unitaire" :error="validations.price.$error" type="number" :disable="isBilled"
      :model-value="courseFee.price" @blur="validations.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'price')" />
    <ni-input in-modal caption="Quantité" :error="validations.count.$error" type="number" :disable="isBilled"
      :model-value="courseFee.count" @blur="validations.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'count')" />
    <ni-input in-modal caption="Description" type="textarea" :model-value="courseFee.description"
      @update:model-value="update($event, 'description')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Enregistrer et fermer" icon-right="save" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Input from '@components/form/Input';

export default {
  name: 'CourseFeeEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    courseFee: { type: Object, default: () => ({}) },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    title: { type: String, default: '' },
    isBilled: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:course-fee'],
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
    const update = (event, path) => {
      emit('update:course-fee', set({ ...props.courseFee }, path, event));
    };

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
