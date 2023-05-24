<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">société mère</span>
    </template>
    <ni-input in-modal :model-value="newHolding.name" @update:model-value="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Raison sociale" :error="validations.name.$error" />
    <ni-input in-modal last caption="Adresse" :model-value="newHolding.address"
      @update:model-value="update($event, 'address')" />
    <template #footer>
      <ni-primary-button icon="add" label="Créer la société mère" @click="submit" :loading="loading" :mode="MODAL" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs } from 'vue';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import PrimaryButton from '@components/PrimaryButton';
import Input from '@components/form/Input';
import { MODAL } from '@data/constants';

export default {
  name: 'HoldingCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newHolding: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-primary-button': PrimaryButton,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-holding'],
  setup (props, { emit }) {
    const { newHolding } = toRefs(props);

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => {
      emit('update:new-holding', set({ ...newHolding.value }, path, event));
    };

    return {
      // Data
      MODAL,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
