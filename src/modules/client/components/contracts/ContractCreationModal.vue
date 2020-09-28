<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer un <span class="text-weight-bold">nouveau contrat</span>
    </template>
    <ni-input in-modal caption="Volume horaire hebdomadaire" type="number" v-model="newContract.weeklyHours"
      :error="validations.weeklyHours.$error" :error-messsage="weeklyHoursError"
      @blur="validations.weeklyHours.$touch" suffix="h" required-field />
    <ni-input in-modal caption="Taux horaire" :error="validations.grossHourlyRate.$error" type="number"
      v-model="newContract.grossHourlyRate" @blur="validations.grossHourlyRate.$touch" suffix="€" required-field
      :error-messsage="grossHourlyRateError" />
    <ni-date-input caption="Date d'effet" :error="validations.startDate.$error" :min="contractMinStartDate"
      v-model="newContract.startDate" in-modal required-field />
    <div class="row margin-input last">
      <div class="col-12">
        <q-checkbox dense v-model="newContract.shouldBeSigned" label="Signature en ligne" />
      </div>
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';

export default {
  name: 'ContractCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newContract: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    grossHourlyRateError: { type: String, default: '' },
    weeklyHoursError: { type: String, default: '' },
    contractMinStartDate: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  methods: {
    submit () {
      this.$emit('submit');
    },
    input (event) {
      this.$emit('input', event);
    },
    hide () {
      this.$emit('hide');
    },
  },
};
</script>
