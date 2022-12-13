<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Rattacher à une <span class="text-weight-bold">structure</span>
    </template>
    <ni-select in-modal :model-value="newCompanyLink.company" @update:model-value="update($event, 'company')"
      :error="validations.company.$error" caption="Structure" :options="companyOptions" required-field />
    <ni-date-input caption="Date de rattachement" :model-value="newCompanyLink.startDate" in-modal last
      @update:model-value="update($event, 'startDate')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Rattacher à la structure" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';

export default {
  name: 'CompanyLinkModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    newCompanyLink: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-company-link'],
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
      this.$emit('update:new-company-link', { ...this.newCompanyLink, [prop]: event });
    },
  },
};
</script>
