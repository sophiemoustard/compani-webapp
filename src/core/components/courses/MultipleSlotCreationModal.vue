<template>
  <ni-modal :model-value="modelValue" @hide="hide">
    <template #title>
      Ajouter des créneaux
    </template>
    <ni-input in-modal caption="Nombre de créneaux à ajouter" type="number" required
      @update:model-value="update($event)" />
    <template #footer>
      <ni-button class="bg-primary full-width modal-btn" label="Ajouter les créneaux" icon="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { toRefs } from 'vue';

export default {
  name: 'MultipleSlotCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    slotsQuantity: { type: Number, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['hide', 'submit', 'update:slots-quantity'],
  setup (props, emit) {
    const { slotsQuantity } = toRefs(props);

    const hide = () => emit('hide');

    const submit = () => emit('submit');

    const update = event => emit('update:slots-quantity', event, slotsQuantity);

    return {
      // Methods
      hide,
      submit,
      update,
    };
  },
};
</script>
