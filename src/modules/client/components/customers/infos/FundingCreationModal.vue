<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">financement</span>
      </template>
      <ni-select in-modal caption="Tiers payeur" :options="fundingTppOptions" v-model="newFunding.thirdPartyPayer"
        :error="validations.thirdPartyPayer.$error" @blur="validations.thirdPartyPayer.$touch" required-field />
      <ni-select in-modal v-model="newFunding.subscription" :options="fundingSubscriptionsOptions"
        caption="Souscription" @blur="validations.subscription.$touch" :error="validations.subscription.$error"
        required-field />
      <ni-date-input v-model="newFunding.startDate" caption="Date de début de prise en charge" in-modal
        @blur="validations.startDate.$touch" :error="validations.startDate.$error" required-field />
      <ni-date-input v-model="newFunding.endDate" in-modal caption="Date de fin de prise en charge"
        :min="minStartDate" />
      <ni-input in-modal v-model="newFunding.folderNumber" caption="Numéro de dossier" />
      <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" v-model="newFunding.frequency"
        @blur="validations.frequency.$touch" :error="validations.frequency.$error" required-field />
      <ni-select in-modal caption="Nature" :options="fundingNatureOptions" v-model="newFunding.nature"
        :error="validations.nature.$error" @blur="validations.nature.$touch" required-field
        @input="resetFundingFrequency" />
      <ni-input in-modal v-if="!isFixedFunding" v-model="newFunding.unitTTCRate" caption="Prix unitaire TTC"
        type="number" @blur="validations.unitTTCRate.$touch" :error="validations.unitTTCRate.$error"
        required-field />
      <ni-input in-modal v-if="isFixedFunding" v-model="newFunding.amountTTC" caption="Montant forfaitaire TTC"
        type="number" @blur="validations.amountTTC.$touch" :error="validations.amountTTC.$error" required-field />
      <ni-input in-modal v-if="!isFixedFunding" v-model="newFunding.careHours"
        caption="Nb. heures prises en charge" type="number" suffix="h" @blur="validations.careHours.$touch"
        :error="validations.careHours.$error" required-field />
      <ni-input in-modal v-if="!isFixedFunding" v-model="newFunding.customerParticipationRate"
        caption="Taux de participation du bénéficiaire" type="number" suffix="%"
        @blur="validations.customerParticipationRate.$touch" :error="validations.customerParticipationRate.$error"
        required-field />
      <ni-option-group v-model="newFunding.careDays" :options="daysOptions" caption="Jours pris en charge"
        type="checkbox" inline @blur="validations.careDays.$touch" :error="validations.careDays.$error"
        required-field />
      <template slot="footer">
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

export default {
  name: 'FundingCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newFunding: { type: Object, default: () => ({}) },
    daysOptions: { type: Array, default: () => [] },
    thirdPartyPayers: { type: Array, default: () => [] },
    fundingSubscriptionsOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-option-group': OptionGroup,
  },
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
      return this.$moment(this.newFunding.startDate).add(1, 'day').toISOString();
    },
  },
  watch: {
    'newFunding.thirdPartyPayer': function () {
      this.setUnitUTTRate();
    },
    'newFunding.nature': function () {
      this.setUnitUTTRate();
    },
  },
  methods: {
    setUnitUTTRate () {
      if (this.isFixedFunding) {
        this.newFunding.unitTTCRate = 0;
      } else {
        const ttp = this.thirdPartyPayers.find(p => p._id === this.newFunding.thirdPartyPayer);
        this.newFunding.unitTTCRate = ttp ? ttp.unitTTCRate : 0;
      }
    },
    resetFundingFrequency () {
      if (this.isFixedFunding && this.newFunding.frequency !== ONCE) this.newFunding.frequency = '';
    },
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('input', this.$event);
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
