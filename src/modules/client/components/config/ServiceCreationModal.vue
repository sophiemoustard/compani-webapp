<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer un <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" :value="newService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @input="update($event, 'name')" />
    <ni-select in-modal caption="Nature" :value="newService.nature" :error="validations.nature.$error"
      @blur="validations.nature.$touch" :options="natureOptions" required-field @input="update($event, 'nature')" />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" @input="update($event, 'defaultUnitAmount')"
      :value="newService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" suffix="€" type="number" />
    <ni-input in-modal caption="TVA" suffix="%" :value="newService.vat" type="number" @input="update($event, 'vat')"
      :error="validations.vat.$error" @blur="validations.vat.$touch"
      error-message="La TVA doit être positive ou nulle" />
    <ni-select in-modal v-if="newService.nature !== FIXED" caption="Plan de majoration" :value="newService.surcharge"
      :options="surchargesOptions" @input="update($event, 'surcharge')" />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" :value="newService.exemptFromCharges" dense
        @input="update($event, 'exemptFromCharges')" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { FIXED } from '@data/constants';

export default {
  name: 'ServiceCreationModal',
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  props: {
    validations: { type: Object, required: true },
    value: { type: Boolean, default: false },
    newService: { type: Object, required: true },
    natureOptions: { type: Array, required: true },
    surchargesOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    loading: { type: Boolean, default: false },
  },
  data () {
    return {
      FIXED,
    };
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('input');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newService', { ...this.newService, [prop]: event });
    },
  },
};
</script>
