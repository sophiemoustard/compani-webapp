<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Téléchargement du <span class="text-weight-bold">fichier de télétransmission</span>
    </template>
    <div class="row q-pb-md">
      <ni-option-group caption="Tiers payeur" :model-value="deliveryFile.thirdPartyPayers" required-field
        @update:model-value="update($event, 'thirdPartyPayers')" :error="validations.thirdPartyPayers.$error"
        inline :options="tppOptions" type="checkbox" />
    </div>
    <ni-select caption="Mois" :model-value="deliveryFile.month" required-field @blur="validations.month.$touch"
      :error="validations.month.$error" @update:model-value="update($event, 'month')" :options="monthOptions"
      in-modal />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Télécharger le fichier" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Modal from '@components/modal/Modal';

export default {
  name: 'DeliveryDownloadModal',
  components: {
    'ni-select': Select,
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
  },
  props: {
    deliveryFile: { type: Object, default: () => ({}) },
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    tppOptions: { type: Array, default: () => [] },
    monthOptions: { type: Array, default: () => [] },
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:deliveryFile'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    update (event, prop) {
      this.$emit('update:deliveryFile', set(this.deliveryFile, prop, event));
    },
  },
};
</script>
