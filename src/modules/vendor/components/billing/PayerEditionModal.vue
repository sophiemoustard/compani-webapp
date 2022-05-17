<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Éditer le <span class="text-weight-bold">payeur</span>
    </template>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="editedPayer" required-field
      @update:model-value="update" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Éditer le payeur" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';

export default {
  name: 'PayerEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedPayer: { type: String, default: () => '' },
    payerOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-payer'],
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
    update (event) {
      this.$emit('update:edited-payer', event);
    },
  },
};
</script>
