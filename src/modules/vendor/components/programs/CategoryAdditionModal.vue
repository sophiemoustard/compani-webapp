<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-select in-modal :model-value="newCategory" :error="validations.$error" :options="categoryOptions" required-field
      @update:model-value="$emit('update:new-category', $event)" @blur="validations.$touch" caption="Catégorie" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la catégorie" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';

export default {
  name: 'CategoryAdditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCategory: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    categoryOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'update:new-category', 'submit'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
