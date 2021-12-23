<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Éditer la <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-input in-modal :value="editedCategory.name" :error="validations.name.$error" @input="update($event, 'name')"
      @blur="validations.name.$touch" required-field caption="Nom" />
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
    value: { type: Boolean, default: false },
    editedCategory: { type: Object, default: () => ({}) },
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
      this.$emit('update:editedCategory', { ...this.editedCategory, [prop]: event });
    },
  },
};
</script>
