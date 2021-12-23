<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-input in-modal :value="newCategory.name" :error="validations.name.$error" @input="update($event, 'name')"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer la catégorie" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'CategoryCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCategory: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newCategory', { ...this.newCategory, [prop]: event });
    },
  },
};
</script>
