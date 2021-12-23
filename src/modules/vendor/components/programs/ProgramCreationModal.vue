<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">programme</span>
    </template>
    <ni-input in-modal :value="newProgram.name" @input="update($event.trim(), 'name')" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal :value="newProgram.category" @input="update($event, 'category')" :options="categoryOptions"
      :error="validations.category.$error" @blur="validations.category.$touch" required-field caption="Catégorie" />
    <template #footer>
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
    newProgram: { type: Object, default: () => ({}) },
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
      this.$emit('update:newProgram', { ...this.newProgram, [prop]: event });
    },
  },
};
</script>
