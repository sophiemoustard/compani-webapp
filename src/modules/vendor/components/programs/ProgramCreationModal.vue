<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">programme</span>
    </template>
    <ni-input in-modal :model-value="newProgram.name" @update:model-value="update($event.trim(), 'name')"
      :error="validations.name.$error" @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal :model-value="newProgram.category" @update:model-value="update($event, 'category')"
      :options="categoryOptions" :error="validations.category.$error" @blur="validations.category.$touch" required-field
      caption="Catégorie" />
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['hide', 'update:model-value', 'update:new-program', 'submit'],
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
      this.$emit('update:new-program', { ...this.newProgram, [prop]: event });
    },
  },
};
</script>
