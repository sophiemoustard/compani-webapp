<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">société mère</span>
    </template>
    <ni-input in-modal :model-value="newHolding.name" @update:model-value="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Raison sociale" :error="validations.name.$error" />
    <ni-search-address :model-value="newHolding.address" error-message="Adresse non valide" in-modal last
      @blur="validations.address.$touch" :error="validations.address.$error"
      @update:model-value="update($event, 'address')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer la société mère" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs } from 'vue';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import SearchAddress from '@components/form/SearchAddress';

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
    'ni-search-address': SearchAddress,
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
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
