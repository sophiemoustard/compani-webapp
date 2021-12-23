<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Ajouter un(e) <span class="text-weight-bold">partenaire</span>
    </template>
    <ni-select in-modal :value="newPartner" @input="update" @blur="validations.$touch" :error="validations.$error"
      required-field caption="Partenaire" :options="partnerOptions" />
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
    value: { type: Boolean, default: false },
    newPartner: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    partnerOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
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
      this.$emit('update:newPartner', value);
    },
  },
};
</script>
