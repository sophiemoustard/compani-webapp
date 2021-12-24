<template>
  <div class="col-12 date-range">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field dense borderless :error="hasError" :error-message="innerErrorMessage">
      <div :class="['date-container', 'justify-center', 'items-center', 'row', borders && 'date-container-borders']">
        <ni-date-input data-cy="date-input" :model-value="modelValue.startDate" class="date-item" @blur="blur"
          @update:model-value="update($event, 'startDate')" />
        <p class="delimiter">-</p>
        <ni-date-input data-cy="date-input" :model-value="modelValue.endDate" :min="modelValue.startDate" @blur="blur"
          @update:model-value="update($event, 'endDate')" class="date-item" />
      </div>
    </q-field>
  </div>
</template>

<script>
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { minDate } from '@helpers/vuelidateCustomVal';
import DateInput from '@components/form/DateInput';
import { REQUIRED_LABEL } from '@data/constants';
import moment from '@helpers/moment';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    modelValue: {
      type: Object,
      default () {
        return {
          startDate: moment().startOf('d').toISOString(),
          endDate: moment().endOf('d').toISOString(),
        };
      },
    },
    requiredField: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    borders: { type: Boolean, default: false },
  },
  emits: ['update:model-value', 'blur', 'update:error'],
  setup () {
    return { v$: useVuelidate() };
  },
  validations () {
    return {
      modelValue: {
        startDate: { required },
        endDate: { required, minDate: minDate(this.modelValue.startDate) },
      },
    };
  },
  computed: {
    hasError () {
      return this.error || this.v$.modelValue.$error;
    },
    innerErrorMessage () {
      if (get(this.v$.modelValue.startDate, 'required.$reponse') === false ||
        get(this.v$.modelValue.endDate, 'required.$reponse') === false) return REQUIRED_LABEL;
      if (get(this.v$.modelValue.endDate, 'minDate.$reponse') === false) {
        return 'La date de fin doit être postérieure à la date de début';
      }

      return this.errorMessage;
    },
  },
  watch: {
    value () {
      this.$emit('update:error', this.v$.modelValue.$error);
    },
  },
  methods: {
    update (value, key) {
      this.v$.modelValue.$touch();
      if (key === 'endDate') value = moment(value).endOf('d').toISOString();

      this.$emit('update:model-value', { ...this.modelValue, [key]: value });
    },
    blur () {
      this.$emit('blur');
    },
  },
};
</script>

<style lang="sass" scoped>
.date-range
  max-width: 100%

.date-container-borders
  border: solid 1px $copper-grey-300
  border-radius: 3px

:deep .q-field__append
  .text-negative
    display: none

:deep .q-field__bottom
  color: $secondary
  padding-top: 3px

.date-container
  width: 100%
  border-radius: 3px
  background-color: white
  & .delimiter
    margin: 0
    color: $copper-grey-700
  :deep .q-field__control
    border: none !important

.date-item
  :deep .q-field__native
    text-align: center
  :deep .q-field--with-bottom
    padding-bottom: 0px
  :deep .q-field__bottom
    display: none
</style>
