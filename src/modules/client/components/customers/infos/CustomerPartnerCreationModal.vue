<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter un(e) <span class="text-weight-bold">partenaire</span>
    </template>
    <ni-select in-modal :model-value="newPartner" @update:model-value="update" @blur="validations.$touch"
      required-field caption="Partenaire" :options="partnerOptions" :error="validations.$error" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter le/la partenaire" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';

export default {
  name: 'CustomerPartnerCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newPartner: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    partnerOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-partner'],
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
      this.$emit('update:new-partner', value);
    },
  },
};
</script>
