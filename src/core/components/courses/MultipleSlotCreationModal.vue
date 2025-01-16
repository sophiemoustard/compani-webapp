<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>Ajouter des créneaux</template>
    <ni-input in-modal caption="Nombre de créneaux à ajouter" type="number" required-field
      :model-value="slotsToAdd.quantity" @update:model-value="update($event, 'quantity')"
      :error="validations.quantity.$error" :error-message="quantityErrorMessage" last />
    <template #footer>
      <ni-button class="bg-primary full-width modal-btn" label="Ajouter les créneaux" icon="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import Button from '@components/Button';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';

export default {
  name: 'MultipleSlotCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    slotsToAdd: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'submit', 'update:slots-to-add', 'update:model-value'],
  setup (props, { emit }) {
    const { validations, slotsToAdd } = toRefs(props);

    const quantityErrorMessage = computed(() => {
      if (validations.value.quantity.strictPositiveNumber.$response === false ||
        validations.value.quantity.integerNumber.$response === false) {
        return 'Nombre non valide, doit être un entier strictement positif .';
      }

      return 'Nombre invalide.';
    });

    const hide = () => emit('hide');

    const submit = () => emit('submit');

    const update = (event, prop) => emit('update:slots-to-add', { ...slotsToAdd.value, [prop]: event });

    const input = event => emit('update:model-value', event);

    return {
      // Computed
      quantityErrorMessage,
      // Methods
      hide,
      submit,
      update,
      input,
    };
  },
};
</script>
