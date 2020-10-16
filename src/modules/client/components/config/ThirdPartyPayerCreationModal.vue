<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newThirdPartyPayer.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field />
      <ni-search-address v-model="newThirdPartyPayer.address" error-message="Adresse invalide" in-modal
        @blur="validations.address.$touch" :error="validations.address.$error" />
      <ni-input in-modal caption="Email" v-model.trim="newThirdPartyPayer.email" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        v-model="newThirdPartyPayer.unitTTCRate" :error="validations.unitTTCRate.$error"
        :error-message="nbrError('unitTTCRate', validations)" />
      <ni-select in-modal v-model="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation"
        :filter="false" required-field :error="validations.billingMode.$error"
        @blur="validations.billingMode.$touch" />
      <div class="row q-mb-md light-checkbox">
        <q-checkbox v-model="newThirdPartyPayer.isApa" label="Financement APA" dense />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import { userMixin } from 'src/core/mixins/userMixin';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';

export default {
  name: 'ThirdPartyPayerCreationModal',
  mixins: [configMixin, userMixin],
  props: {
    value: { type: Boolean, default: false },
    newThirdPartyPayer: { type: Object, default: () => ({}) },
    billingModeOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
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
  },
};
</script>
