<template>
  <div class="col-12 margin-input">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hourError || hasError" error-message="Date(s) et heure(s) invalide(s)" borderless>
      <div class="datetime-container row justify-evenly items-center">
        <ni-date-input :model-value="modelValue.startDate" @update:model-value="update($event, 'startDate')"
          @blur="blurHandler" :disable="disable || disableStartDate" :max="max" class="date-item" />
        <ni-time-input :model-value="startHour" @update:model-value="updateHours($event, 'startHour')" class="time-item"
          @blur="blurHandler" :disable="disable || disableStartHour" @lock-click="startClick" :locked="startLocked" />
        <p class="delimiter">-</p>
        <ni-time-input :model-value="endHour" @update:model-value="updateHours($event, 'endHour')" class="time-item"
          :disable="disable || disableEndHour" :min="min" @lock-click="endClick" :locked="endLocked"
          @blur="blurHandler" />
        <ni-date-input :model-value="modelValue.endDate" @update:model-value="update($event, 'endDate')"
          @blur="blurHandler" :min="modelValue.startDate" :disable="disable || disableEndDate" :max="max"
          class="date-item" />
      </div>
    </q-field>
  </div>
</template>

<script>
import get from 'lodash/get';
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import DateInput from '@components/form/DateInput';
import TimeInput from '@components/form/TimeInput';
import { minDate } from '@helpers/vuelidateCustomVal';
import CompaniDate from '@helpers/dates/companiDate';

export default {
  components: {
    'ni-date-input': DateInput,
    'ni-time-input': TimeInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    modelValue: { type: Object, default: () => ({}) },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    disableStartDate: { type: Boolean, default: false },
    disableEndDate: { type: Boolean, default: false },
    disableEndHour: { type: Boolean, default: false },
    disableStartHour: { type: Boolean, default: false },
    max: { type: String, default: '' },
    startLocked: { type: Boolean, default: false },
    endLocked: { type: Boolean, default: false },
  },
  emits: ['blur', 'update:model-value', 'start-lock-click', 'end-lock-click'],
  setup () {
    const hourError = ref(false);

    return {
      hourError,
      v$: useVuelidate(),
    };
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
      if (this.error || get(this.v$, 'modelValue.$error.$response')) return true;
      const { startDate, endDate } = this.modelValue;

      return CompaniDate(startDate).isAfter(endDate);
    },
    startHour () {
      return CompaniDate(this.modelValue.startDate).format('HH:mm');
    },
    endHour () {
      return CompaniDate(this.modelValue.endDate).format('HH:mm');
    },
    min () {
      if (CompaniDate(this.modelValue.startDate).format('yyyy/LL/dd')
        === CompaniDate(this.modelValue.endDate).format('yyyy/LL/dd')) {
        return this.startHour;
      }
      return null;
    },
  },
  methods: {
    blurHandler () {
      this.v$.modelValue.$touch();
      this.$emit('blur');
    },
    setDateHours (date, hour) {
      const companiDateHour = CompaniDate(hour, 'HH:mm').getUnits(['hour', 'minute']);
      return CompaniDate(date).set({
        ...companiDateHour,
        second: 0,
        millisecond: 0,
      }).toISO();
    },
    update (date, key) {
      const hoursFields = ['hour', 'minute', 'second', 'millisecond'];
      const dateObject = CompaniDate(this.modelValue[key]).getUnits(hoursFields);
      const dates = { ...this.modelValue, [key]: CompaniDate(date).set({ ...dateObject }).toISO() };
      if (key === 'startDate' && this.disableEndDate) {
        const endDateObject = CompaniDate(this.modelValue.endDate).getUnits(hoursFields);
        dates.endDate = CompaniDate(date).set({ ...endDateObject }).toISO();
      }
      if (key === 'endDate') dates.endDate = CompaniDate(dates.endDate).endOf('day').toISO();

      this.$emit('update:model-value', dates);
    },
    updateHours (value, key) {
      try {
        this.hourError = false;
        const dates = { ...this.modelValue };

        if (key === 'endHour') dates.endDate = this.setDateHours(dates.endDate, value);
        if (key === 'startHour') {
          dates.startDate = this.setDateHours(dates.startDate, value);

          if (!this.disableEndHour && CompaniDate(value, 'HH:mm').isSameOrAfter(this.endHour)) {
            const max = CompaniDate(dates.startDate).endOf('day');
            const shiftedEndDate = CompaniDate(dates.startDate).add({ hours: 2 });

            dates.endDate = shiftedEndDate.isSameOrBefore(max) ? shiftedEndDate.toISO() : max.toISO();
          }
        }

        this.$emit('update:model-value', dates);
      } catch (e) {
        this.hourError = true;
        if (e.message.startsWith('Invalid DateTime: unparsable')) return '';
        console.error(e);
      }
    },
    startClick () {
      this.$emit('start-lock-click');
    },
    endClick () {
      this.$emit('end-lock-click');
    },
  },
};
</script>

<style lang="sass" scoped>
.datetime-container
  width: 100%
  border: 1px solid $copper-grey-300
  border-radius: 3px
  @media screen and (min-width: 768px)
    flex-wrap: nowrap

:deep(.q-field__control)
  min-height: 40px
  border: none !important
  .q-field__marginal.q-anchor--skip
    display: none

.date-item
  @media screen and (min-width: 768px)
    width: 26%
  @media screen and (max-width: 767px)
    width: 60%
  :deep(.q-field--with-bottom)
    padding: 0
  :deep(.q-field__control)
    min-height: 35px
  :deep(.q-field__native)
    min-height: auto
  :deep(.q-field__inner)
    .q-field__bottom
      display: none

.time-item
  @media screen and (min-width: 768px)
    width: 18%
  @media screen and (max-width: 767px)
    width: 40%
  :deep(.q-field--with-bottom)
    padding: 0
  :deep(.q-field__inner)
    .q-field__bottom
      display: none
  :deep(.q-field__control)
    min-height: 35px
  :deep(.q-field__native)
    min-height: auto

.delimiter
  margin: 0
  color: $copper-grey-700
  @media screen and (max-width: 767px)
    display: none
</style>
