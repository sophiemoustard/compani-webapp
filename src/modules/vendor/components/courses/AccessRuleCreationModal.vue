<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter une <span class="text-weight-bold">règle d'accès</span>
    </template>
    <ni-select in-modal :model-value="newAccessRule" @update:model-value="update" :error="validations.$error"
      caption="Structure" :options="companyOptions" last required-field />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la règle d'accès" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';

export default {
  name: 'AccessRuleCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    newAccessRule: { type: String, default: '' },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-access-rule'],
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
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
      this.$emit('update:new-access-rule', value);
    },
  },
};
</script>
