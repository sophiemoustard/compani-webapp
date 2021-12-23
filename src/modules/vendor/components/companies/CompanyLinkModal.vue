<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template #title>
      Rattacher à une <span class="text-weight-bold">structure</span>
    </template>
    <ni-select in-modal :value="newCompany" @input="update" :error="validations.$error"
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
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    newCompany: { type: String, default: '' },
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
    update (value) {
      this.$emit('update:newCompany', value);
    },
  },
};
</script>
