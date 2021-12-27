<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Créer un <span class="text-weight-bold">nouveau contrat</span>
    </template>
    <ni-input in-modal caption="Volume horaire hebdomadaire" type="number" :model-value="newContract.weeklyHours"
      :error="validations.weeklyHours.$error" :error-message="weeklyHoursError" @blur="validations.weeklyHours.$touch"
      @update:model-value="update($event, 'weeklyHours')" suffix="h" required-field />
    <ni-input in-modal caption="Taux horaire" :error="validations.grossHourlyRate.$error" type="number"
      :model-value="newContract.grossHourlyRate" @blur="validations.grossHourlyRate.$touch" suffix="€" required-field
      :error-message="grossHourlyRateError" @update:model-value="update($event, 'grossHourlyRate')" />
    <ni-date-input caption="Date d'effet" :error="validations.startDate.$error" :min="contractMinStartDate"
      :model-value="newContract.startDate" in-modal required-field @update:model-value="update($event, 'startDate')" />
    <div class="row margin-input last">
      <div class="col-12">
        <q-checkbox dense :model-value="newContract.shouldBeSigned" label="Signature en ligne"
          @update:model-value="update($event, 'shouldBeSigned')" />
      </div>
    </div>
    <template #footer>
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['update:model-value', 'submit', 'hide', 'update:new-contract'],
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
    update (event, prop) {
      this.$emit('update:new-contract', { ...this.newContract, [prop]: event });
    },
  },
};
</script>
