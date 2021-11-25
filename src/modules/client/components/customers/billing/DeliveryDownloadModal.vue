<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Téléchargement du <span class="text-weight-bold">fichier de télétransmission</span>
    </template>
    <div class="row q-pb-md">
      <ni-option-group caption="Tiers payeur(s)" :value="deliveryFile.thirdPartyPayers" required-field type="checkbox"
        :options="tppOptions" @input="update($event, 'thirdPartyPayers')" :error="validations.thirdPartyPayers.$error"
        inline />
    </div>
    <ni-select in-modal caption="Mois" :value="deliveryFile.month" required-field :options="monthOptions"
      @blur="validations.month.$touch" :error="validations.month.$error" @input="update($event, 'month')" />
    <template slot="footer">
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
    value: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    tppOptions: { type: Array, default: () => [] },
    monthOptions: { type: Array, default: () => [] },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
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
