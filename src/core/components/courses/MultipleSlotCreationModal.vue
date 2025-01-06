<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>Ajouter des créneaux</template>
    <ni-input in-modal caption="Nombre de créneaux à ajouter" type="number" required :model-value="slotsQuantity"
      @update:model-value="update" />
    <template #footer>
      <ni-button class="bg-primary full-width modal-btn" label="Ajouter les créneaux" icon="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Button from '@components/Button';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';

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
    'ni-button': Button,
  },
  emits: ['hide', 'submit', 'update:slots-quantity', 'update:model-value'],
  setup (_, { emit }) {
    const hide = () => emit('hide');

    const submit = () => emit('submit');

    const update = event => emit('update:slots-quantity', event);

    const input = event => emit('update:model-value', event);

    return {
      // Methods
      hide,
      submit,
      update,
      input,
    };
  },
};
</script>
