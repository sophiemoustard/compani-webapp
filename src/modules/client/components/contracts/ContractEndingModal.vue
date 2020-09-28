<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Terminer un <span class="text-weight-bold">contrat</span>
    </template>
    <ni-date-input caption="Date de notification" v-model="contractToEnd.endNotificationDate" in-modal
      required-field @blur="validations.endNotificationDate.$touch" :error="validations.endNotificationDate.$error" />
    <ni-date-input caption="Date de fin de contrat" v-model="contractToEnd.endDate" :min="contractMinEndDate"
      in-modal required-field @blur="validations.endDate.$touch" :error="validations.endDate.$error" />
    <ni-select in-modal caption="Motif" :options="endContractReasons" v-model="contractToEnd.endReason" required-field
      @blur="validations.endReason.$touch" :error="validations.endReason.$error" @input="resetOtherMisc" />
    <ni-input in-modal caption="Autres" v-if="contractToEnd.endReason === OTHER" v-model="contractToEnd.otherMisc"
      required-field @blur="validations.otherMisc.$touch" :error="validations.otherMisc.$error" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary"
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
        delete this.contractToEnd.otherMisc;
        this.validations.otherMisc.$reset();
      }
    },
  },
};
</script>
