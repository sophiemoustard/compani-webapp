<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-select in-modal v-model="newCategory.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field caption="Catégorie" :options="categoryOptions" />
    <template slot="footer">
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
    value: { type: Boolean, default: false },
    newCategory: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    categoryOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
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
  },
};
</script>
