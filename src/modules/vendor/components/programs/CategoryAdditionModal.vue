<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">catégorie</span>
    </template>
    <ni-select in-modal v-model="newCategory.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field caption="Catégorie" :options="restrictedCategoryOptions" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter au programme" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Categories from '@api/Categories';

export default {
  name: 'CategoryAdditionModal',
  props: {
    value: { type: Boolean, default: false },
    newCategory: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    categories: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  data () {
    return {
      categoryOptions: [],
    };
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  computed: {
    restrictedCategoryOptions () {
      return this.categoryOptions
        .map(c => ({ label: c.name, value: c._id, disable: !!this.categories.find(e => e._id === c._id) }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
  },
  async created () {
    this.categoryOptions = await Categories.list();
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
