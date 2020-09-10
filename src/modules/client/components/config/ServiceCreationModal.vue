<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer un <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" v-model="newService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field />
    <ni-select in-modal caption="Nature" v-model="newService.nature" :error="validations.nature.$error"
      @blur="validations.nature.$touch" :options="natureOptions" required-field />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
      v-model="newService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" />
    <ni-input in-modal caption="TVA" suffix="%" v-model="newService.vat" type="number"
      :error="validations.vat.$error" @blur="validations.vat.$touch"
      error-message="La TVA doit être positive ou nulle" />
    <ni-select in-modal v-if="newService.nature !== FIXED" caption="Plan de majoration" v-model="newService.surcharge"
      :options="surchargesOptions" clearable />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" v-model="newService.exemptFromCharges" dense />
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
  },
};
</script>
