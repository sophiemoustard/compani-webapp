<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Terminer un <span class="text-weight-bold">contrat</span>
    </template>
    <ni-date-input caption="Date de notification" :value="contractToEnd.endNotificationDate" in-modal
      @input="update($event, 'endNotificationDate')" required-field @blur="validations.endNotificationDate.$touch"
      :error="validations.endNotificationDate.$error" />
    <ni-date-input caption="Date de fin de contrat" :value="contractToEnd.endDate" :min="contractMinEndDate"
      in-modal required-field @blur="validations.endDate.$touch" :error="validations.endDate.$error"
      @input="update($event, 'endDate')" />
    <ni-select in-modal caption="Motif" :options="endContractReasons" :value="contractToEnd.endReason" required-field
      @blur="validations.endReason.$touch" :error="validations.endReason.$error"
      @input="updateAndResetOtherMisc($event, 'endReason')" />
    <ni-input in-modal caption="Autres" v-if="contractToEnd.endReason === OTHER" :value="contractToEnd.otherMisc"
      required-field @blur="validations.otherMisc.$touch" :error="validations.otherMisc.$error"
      @input="update($event, 'otherMisc')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="close" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';
import { OTHER } from '@data/constants';

export default {
  name: 'ContractEndingModal',
  props: {
    value: { type: Boolean, default: false },
    contractToEnd: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    contractMinEndDate: { type: String, default: '' },
    endContractReasons: { type: Array, default: () => [] },
  },
  data () {
    return {
      OTHER,
    };
  },
  components: {
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
    'ni-select': Select,
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
    resetOtherMisc () {
      if (this.contractToEnd.endReason !== OTHER && this.contractToEnd.otherMisc) {
        this.update('', 'otherMisc');
        this.validations.otherMisc.$reset();
      }
    },
    updateAndResetOtherMisc (event, prop) {
      this.update(event, prop);
      this.resetOtherMisc();
    },
    update (event, prop) {
      this.$emit('update:contractToEnd', { ...this.contractToEnd, [prop]: event });
    },
  },
};
</script>
