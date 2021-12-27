<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Terminer un <span class="text-weight-bold">contrat</span>
    </template>
    <ni-date-input caption="Date de notification" :model-value="contractToEnd.endNotificationDate" in-modal
      @update:model-value="update($event, 'endNotificationDate')" @blur="validations.endNotificationDate.$touch"
      :error="validations.endNotificationDate.$error" required-field />
    <ni-date-input caption="Date de fin de contrat" :model-value="contractToEnd.endDate" :min="contractMinEndDate"
      in-modal required-field @blur="validations.endDate.$touch" :error="validations.endDate.$error"
      @update:model-value="update($event, 'endDate')" />
    <ni-select in-modal caption="Motif" :options="endContractReasons" :model-value="contractToEnd.endReason"
      @blur="validations.endReason.$touch" :error="validations.endReason.$error" required-field
      @update:model-value="updateAndResetOtherMisc($event, 'endReason')" :clearable="false" />
    <ni-input in-modal caption="Autres" v-if="contractToEnd.endReason === OTHER" :model-value="contractToEnd.otherMisc"
      required-field @blur="validations.otherMisc.$touch" :error="validations.otherMisc.$error"
      @update:model-value="update($event, 'otherMisc')" />
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
    modelValue: { type: Boolean, default: false },
    contractToEnd: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    contractMinEndDate: { type: String, default: '' },
    endContractReasons: { type: Array, default: () => [] },
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:contract-to-end'],
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
      this.$emit('update:model-value', event);
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
      this.$emit('update:contract-to-end', { ...this.contractToEnd, [prop]: event });
    },
  },
};
</script>
