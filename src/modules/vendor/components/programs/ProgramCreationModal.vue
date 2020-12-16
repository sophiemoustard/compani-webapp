<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">programme</span>
    </template>
    <ni-input in-modal :value="name" @input="update($event, 'name')" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal :value="category" @input="update($event, 'category')" :error="validations.category.$error"
        @blur="validations.category.$touch" required-field caption="Catégorie" :options="categoryOptions" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le programme" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Categories from '@api/Categories';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'ProgramCreationModal',
  props: {
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    name: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  data () {
    return {
      categoryOptions: [],
    };
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  async created () {
    try {
      const categories = await Categories.list();
      this.categoryOptions = formatAndSortOptions(categories, 'name');
    } catch (e) {
      console.error(e);
      this.categoryOptions = [];
    }
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
      this.$emit(`update:${prop}`, event.trim());
    },
  },
};
</script>
