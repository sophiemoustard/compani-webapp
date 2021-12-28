<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Rattacher à une <span class="text-weight-bold">structure</span>
    </template>
    <ni-select in-modal :model-value="newCompany" @update:model-value="update" :error="validations.$error"
      caption="Structure" :options="companyOptions" last required-field />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Rattacher à la structure" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';

export default {
  name: 'CompanyLinkModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    newCompany: { type: String, default: '' },
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:newCompany'],
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
    update (value) {
      this.$emit('update:newCompany', value);
    },
  },
};
</script>
