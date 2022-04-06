<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Ajouter un <span class="text-weight-bold">{{ creationModalNature.toLowerCase() }}</span>
    </template>
    <ni-btn-toggle :model-value="newCoursePayment.nature" :options="paymentNatureOptions"
      @update:model-value="update($event, 'nature')" />
    <div>
      {{ creationModalNature }} pour la facture
      <span class="text-weight-bold">
          {{ coursePaymentMetaInfo.number }} - {{ formatPrice(coursePaymentMetaInfo.netInclTaxes) }}
      </span>
    </div>
    <div class="name">{{ coursePaymentMetaInfo.courseName }}</div>
    <ni-input in-modal caption="Montant" suffix="€" type="number" required-field
      :model-value="newCoursePayment.netInclTaxes" @update:model-value="update($event, 'netInclTaxes')"
      :error="validations.netInclTaxes.$error" @blur="validations.netInclTaxes.$touch"
      :error-message="netInclTaxesError" />
    <ni-select in-modal caption="Type" :model-value="newCoursePayment.type" required-field :options="paymentOptions"
      @update:model-value="update($event, 'type')" @blur="validations.type.$touch" :error="validations.type.$error" />
    <ni-date-input :model-value="newCoursePayment.date" @update:model-value="update($event, 'date')" in-modal
      required-field :error="validations.date.$error" @blur="validations.date.$touch" caption="Date" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Créer le paiement" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import set from 'lodash/set';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Button from '@components/Button';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';
import ButtonToggle from '@components/ButtonToggle';
import { formatPrice } from '@helpers/utils';
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS, CESU } from '@data/constants';

export default {
  name: 'PaymentCreationModal',
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
    'ni-btn-toggle': ButtonToggle,
    'ni-button': Button,
  },
  props: {
    newCoursePayment: { type: Object, default: () => ({}) },
    coursePaymentMetaInfo: { type: Object, default: () => ({}) },
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-course-payment'],
  data () {
    return {
      paymentOptions: PAYMENT_OPTIONS.filter(option => option.value !== CESU),
      paymentNatureOptions: PAYMENT_NATURE_OPTIONS,
    };
  },
  computed: {
    netInclTaxesError () {
      if (get(this.validations, 'netInclTaxes.required.$response') === false) return REQUIRED_LABEL;
      return 'Montant TTC non valide';
    },
    creationModalNature () {
      if (!this.newCoursePayment.nature) return '';
      return this.paymentNatureOptions
        .find(option => option.value === this.newCoursePayment.nature).label;
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
    update (event, path) {
      this.$emit('update:new-course-payment', set({ ...this.newCoursePayment }, path, event));
    },
    formatPrice,
  },
};
</script>

<style lang="sass" scoped>
.name
  color: $copper-grey-500
  font-size: 14px
  margin-bottom: 16px
</style>
