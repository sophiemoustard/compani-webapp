<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer la <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-input in-modal :model-value="editedCategory.name" :error="validations.name.$error"
      @update:model-value="update($event, 'name')" @blur="validations.name.$touch" required-field caption="Nom" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Éditer la catégorie" color="primary" :loading="loading"
        icon-right="edit" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'CategoryEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedCategory: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-category'],
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
    update (event, prop) {
      this.$emit('update:edited-category', { ...this.editedCategory, [prop]: event });
    },
  },
};
</script>
