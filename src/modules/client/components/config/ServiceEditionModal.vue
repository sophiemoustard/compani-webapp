<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Éditer le <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" v-model="editedService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field />
    <ni-date-input caption="Date d'effet" v-model="editedService.startDate" :error="validations.startDate.$error"
      @blur="validations.startDate.$touch" :min="minStartDate" in-modal required-field />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
      v-model="editedService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" />
    <ni-input in-modal caption="TVA" suffix="%" v-model="editedService.vat" :error="validations.vat.$error"
      type="number" @blur="validations.vat.$touch" error-message="La TVA doit être positive ou nulle" />
    <ni-select in-modal v-if="editedService.nature !== FIXED" caption="Plan de majoration"
      v-model="editedService.surcharge" :options="surchargesOptions" clearable />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" v-model="editedService.exemptFromCharges" dense />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { FIXED } from '@data/constants';

export default {
  name: 'ServiceEditionModal',
  components: {
    'ni-date-input': DateInput,
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  props: {
    validations: { type: Object, required: true },
    value: { type: Boolean, default: false },
    editedService: { type: Object, required: true },
    surchargesOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    loading: { type: Boolean, default: false },
    minStartDate: { type: String, required: true },
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
