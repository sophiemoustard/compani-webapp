<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter <span class="text-weight-bold">le prix de la formation</span>
    </template>
     <ni-input in-modal :caption="'Prix du programme'" :error="validations.$error" type="number" :model-value="price"
      @blur="validations.$touch" suffix="€" required-field :error-message="errorMessage" @update:model-value="update" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter le prix" icon-right="add" color="white"
        @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Input from '@components/form/Input';

export default {
  name: 'TrainingContractPriceAdditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    price: { type: Number, default: () => 0 },
    errorMessage: { type: String, default: () => '' },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:price'],
  setup (_, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = event => emit('update:price', Number(event));

    return {
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
