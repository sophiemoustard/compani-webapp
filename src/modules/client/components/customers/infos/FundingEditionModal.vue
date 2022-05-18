<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Éditer le <span class="text-weight-bold">financement</span>
      </template>
      <ni-input in-modal v-if="needFundingPlanIdForEditedFunding" :model-value="editedFunding.fundingPlanId"
        caption="ID du plan de financement" @update:model-value="update($event, 'fundingPlanId')" required-field
        :error="validations.fundingPlanId.$error" @blur="validations.fundingPlanId.$touch" />
      <ni-date-input :model-value="editedFunding.startDate" caption="Date de début de prise en charge"
        :max="editedFundingMaxStartDate" class="last" in-modal @blur="validations.startDate.$touch"
        :error="validations.startDate.$error" required-field @update:model-value="update($event, 'startDate')" />
      <ni-date-input :model-value="editedFunding.endDate" caption="Date de fin de prise en charge" in-modal
        :min="minEndDate" @update:model-value="update($event, 'endDate')" @blur="validations.endDate.$touch"
        :error="validations.endDate.$error" error-message="La date de fin doit etre postérieure à la date de début" />
      <ni-input in-modal :model-value="editedFunding.folderNumber" caption="Numéro de dossier"
        @update:model-value="update($event, 'folderNumber')" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="editedFunding.unitTTCRate" caption="Prix unitaire TTC"
        type="number" @blur="validations.unitTTCRate.$touch" :error="validations.unitTTCRate.$error" required-field
        :error-message="unitTtcRateErrorMessage" @update:model-value="update($event, 'unitTTCRate')" />
      <ni-input in-modal v-if="isFixedFunding" :model-value="editedFunding.amountTTC" caption="Montant forfaitaire TTC"
        type="number" @blur="validations.amountTTC.$touch" :error="validations.amountTTC.$error" required-field
        :error-message="amountTtcErrorMessage" @update:model-value="update($event, 'amountTTC')" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="editedFunding.careHours" required-field suffix="h"
        caption="Nb. heures prises en charge par mois" :error-message="careHoursErrorMessage" type="number"
        :error="validations.careHours.$error" @blur="validations.careHours.$touch"
        @update:model-value="update($event, 'careHours')" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="editedFunding.customerParticipationRate" type="number"
        caption="Taux de participation du bénéficiaire" :error-message="customerParticipationRateErrorMessage"
        @blur="validations.customerParticipationRate.$touch" :error="validations.customerParticipationRate.$error"
        required-field suffix="%" @update:model-value="update($event, 'customerParticipationRate')" />
      <ni-option-group :model-value="editedFunding.careDays" :options="daysOptions" caption="Jours pris en charge"
        type="checkbox" inline @blur="validations.careDays.$touch" :error="validations.careDays.$error"
        required-field @update:model-value="update($event, 'careDays')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Éditer le financement" icon-right="check" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import OptionGroup from '@components/form/OptionGroup';
import { FIXED } from '@data/constants';
import moment from '@helpers/moment';

export default {
  name: 'FundingEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedFunding: { type: Object, default: () => ({}) },
    daysOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    careHoursErrorMessage: { type: String, default: '' },
    amountTtcErrorMessage: { type: String, default: '' },
    unitTtcRateErrorMessage: { type: String, default: '' },
    customerParticipationRateErrorMessage: { type: String, default: '' },
    needFundingPlanIdForEditedFunding: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-date-input': DateInput,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-funding'],
  computed: {
    editedFundingMaxStartDate () {
      return this.editedFunding && this.editedFunding.endDate
        ? moment(this.editedFunding.endDate).subtract(1, 'day').toISOString()
        : '';
    },
    isFixedFunding () {
      return this.editedFunding.nature === FIXED;
    },
    minEndDate () {
      return moment(this.editedFunding.startDate).add(1, 'day').toISOString();
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:edited-funding', { ...this.editedFunding, [prop]: event });
    },
  },
};
</script>
