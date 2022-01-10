<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Ajouter un <span class="text-weight-bold">financement</span>
      </template>
      <ni-select in-modal caption="Tiers payeur" :options="fundingTppOptions" :model-value="newFunding.thirdPartyPayer"
        :error="validations.thirdPartyPayer.$error" @blur="validations.thirdPartyPayer.$touch" required-field
        @update:model-value="update($event, 'thirdPartyPayer')" />
        <ni-input in-modal v-if="needFundingPlanIdForNewFunding" :model-value="newFunding.fundingPlanId"
        caption="ID du plan de financement" @update:model-value="update($event, 'fundingPlanId')" required-field
        :error="validations.fundingPlanId.$error" @blur="validations.fundingPlanId.$touch" />
      <ni-select in-modal :model-value="newFunding.subscription" :options="fundingSubscriptionsOptions"
        caption="Souscription" @blur="validations.subscription.$touch" :error="validations.subscription.$error"
        required-field @update:model-value="update($event, 'subscription')" />
      <ni-date-input :model-value="newFunding.startDate" caption="Date de début de prise en charge" in-modal
        @blur="validations.startDate.$touch" :error="validations.startDate.$error" required-field
        @update:model-value="update($event, 'startDate')" />
      <ni-date-input :model-value="newFunding.endDate" in-modal caption="Date de fin de prise en charge"
        :min="minStartDate" @update:model-value="update($event, 'endDate')" @blur="validations.endDate.$touch"
        :error="validations.endDate.$error" error-message="La date de fin doit etre postérieure à la date de début" />
      <ni-input in-modal :model-value="newFunding.folderNumber" caption="Numéro de dossier"
        @update:model-value="update($event, 'folderNumber')" />
      <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" :model-value="newFunding.frequency"
        @blur="validations.frequency.$touch" :error="validations.frequency.$error" required-field
        @update:model-value="update($event, 'frequency')" />
      <ni-select in-modal caption="Nature" :options="fundingNatureOptions" :model-value="newFunding.nature"
        :error="validations.nature.$error" @blur="validations.nature.$touch" required-field
        @update:model-value="update($event, 'nature')" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="newFunding.unitTTCRate" caption="Prix unitaire TTC"
        type="number" @blur="validations.unitTTCRate.$touch" :error="validations.unitTTCRate.$error"
        required-field @update:model-value="update($event, 'unitTTCRate')" :error-message="unitTtcRateErrorMessage" />
      <ni-input in-modal v-if="isFixedFunding" :model-value="newFunding.amountTTC" caption="Montant forfaitaire TTC"
        type="number" @blur="validations.amountTTC.$touch" :error="validations.amountTTC.$error" required-field
        @update:model-value="update($event, 'amountTTC')" :error-message="amountTtcErrorMessage" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="newFunding.careHours" @blur="validations.careHours.$touch"
        caption="Nb. heures prises en charge" type="number" suffix="h" @update:model-value="update($event, 'careHours')"
        :error="validations.careHours.$error" required-field :error-message="careHoursErrorMessage" />
      <ni-input in-modal v-if="!isFixedFunding" :model-value="newFunding.customerParticipationRate"
        caption="Taux de participation" type="number" suffix="%" required-field
        @blur="validations.customerParticipationRate.$touch" :error="validations.customerParticipationRate.$error"
        @update:model-value="update($event, 'customerParticipationRate')"
        :error-message="customerParticipationRateErrorMessage" />
      <ni-option-group :model-value="newFunding.careDays" :options="daysOptions" caption="Jours pris en charge"
        type="checkbox" inline @blur="validations.careDays.$touch" :error="validations.careDays.$error"
        required-field @update:model-value="update($event, 'careDays')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un financement" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import OptionGroup from '@components/form/OptionGroup';
import { FIXED, FUNDING_FREQ_OPTIONS, ONCE, NATURE_OPTIONS } from '@data/constants';
import moment from '@helpers/moment';

export default {
  name: 'FundingCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newFunding: { type: Object, default: () => ({}) },
    daysOptions: { type: Array, default: () => [] },
    thirdPartyPayers: { type: Array, default: () => [] },
    fundingSubscriptionsOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    careHoursErrorMessage: { type: String, default: '' },
    amountTtcErrorMessage: { type: String, default: '' },
    unitTtcRateErrorMessage: { type: String, default: '' },
    customerParticipationRateErrorMessage: { type: String, default: '' },
    needFundingPlanIdForNewFunding: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-funding'],
  data () {
    return {
      fundingNatureOptions: NATURE_OPTIONS,
    };
  },
  computed: {
    isFixedFunding () {
      return this.newFunding.nature === FIXED;
    },
    fundingTppOptions () {
      return this.thirdPartyPayers.map(tpp => ({ label: tpp.name, value: tpp._id }));
    },
    fundingFreqOptions () {
      if (this.isFixedFunding) {
        return FUNDING_FREQ_OPTIONS.filter(option => option.value === ONCE);
      }

      return FUNDING_FREQ_OPTIONS;
    },
    minStartDate () {
      return moment(this.newFunding.startDate).add(1, 'day').toISOString();
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
      this.$emit('update:new-funding', { ...this.newFunding, [prop]: event });
    },
  },
};
</script>
