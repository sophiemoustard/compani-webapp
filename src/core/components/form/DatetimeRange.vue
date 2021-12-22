<template>
  <div class="col-12 margin-input">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" error-message="Date(s) et heure(s) invalide(s)" borderless>
      <div class="datetime-container row justify-evenly items-center">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
          @blur="blurHandler" :disable="disable || disableStartDate" :max="max" />
        <ni-time-input :value="startHour" @input="updateHours($event, 'startHour')" class="time-item"
          @blur="blurHandler" :disable="disable || disableStartHour" @lockClick="startClick" :locked="startLocked" />
        <p class="delimiter">-</p>
        <ni-time-input :value="endHour" @input="updateHours($event, 'endHour')" class="time-item" @blur="blurHandler"
          :disable="disable || disableEndHour" :min="min" @lockClick="endClick" :locked="endLocked" />
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          @blur="blurHandler" :min="value.startDate" :disable="disable || disableEndDate" :max="max" />
      </div>
    </q-field>
  </div>
</template>

<script>
import pick from 'lodash/pick';
import { required } from 'vuelidate/lib/validators';
import DateInput from '@components/form/DateInput';
import TimeInput from '@components/form/TimeInput';
import { minDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';

export default {
  components: {
    'ni-date-input': DateInput,
    'ni-time-input': TimeInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    value: { type: Object, default: () => ({}) },
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
  validations () {
    return {
      value: {
        startDate: { required },
        endDate: { required, minDate: minDate(this.value.startDate) },
      },
    };
  },
  computed: {
    hasError () {
      if (this.error || this.$v.value.$error) return true;

      return moment(this.value.startDate).isAfter(moment(this.value.endDate));
    },
    startHour () {
      return moment(this.value.startDate).format('HH:mm');
    },
    endHour () {
      return moment(this.value.endDate).format('HH:mm');
    },
    min () {
      if (moment(this.value.startDate).format('YYYY/MM/DD') === moment(this.value.endDate).format('YYYY/MM/DD')) {
        return this.startHour;
      }
      return null;
    },
  },
  methods: {
    blurHandler () {
      this.$v.value.$touch();
      this.$emit('blur');
    },
    setDateHours (date, hour) {
      const splitHour = hour.split(':');
      return moment(date).set({
        hours: Number.parseInt(splitHour[0], 10),
        minutes: Number.parseInt(splitHour[1], 10),
        seconds: 0,
        milliseconds: 0,
      }).toISOString();
    },
    update (date, key) {
      const hoursFields = ['hours', 'minutes', 'seconds', 'milliseconds'];
      const dateObject = pick(moment(this.value[key]).toObject(), hoursFields);
      const dates = { ...this.value, [key]: moment(date).set({ ...dateObject }).toISOString() };
      if (key === 'startDate' && this.disableEndDate) {
        const endDateObject = pick(moment(this.value.endDate).toObject(), hoursFields);
        dates.endDate = moment(date).set({ ...endDateObject }).toISOString();
      }
      if (key === 'endDate') dates.endDate = moment(dates.endDate).endOf('d').toISOString();

      this.$emit('input', dates);
    },
    updateHours (value, key) {
      const dates = { ...this.value };
      if (key === 'endHour') dates.endDate = this.setDateHours(dates.endDate, value);
      if (key === 'startHour') {
        dates.startDate = this.setDateHours(dates.startDate, value);
        if (!this.disableEndHour && moment(value, 'HH:mm').isSameOrAfter(moment(this.endHour, 'HH:mm'))) {
          const max = moment(dates.startDate).endOf('d');
          dates.endDate = moment.min(moment(dates.startDate).add(2, 'H'), max).toISOString();
        }
      }

      this.$emit('input', dates);
    },
    startClick () {
      this.$emit('startLockClick');
    },
    endClick () {
      this.$emit('endLockClick');
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

:deep .q-field__control
  min-height: 40px
  border: none !important
  .q-field__marginal.q-anchor--skip
    display: none

.date-item
  @media screen and (min-width: 768px)
    width: 26%
  @media screen and (max-width: 767px)
    width: 60%
  :deep .q-field--with-bottom
    padding: 0
  :deep .q-field__control
    min-height: 35px
  :deep .q-field__native
    min-height: auto
  :deep .q-field__inner
    .q-field__bottom
      display: none

.time-item
  @media screen and (min-width: 768px)
    width: 18%
  @media screen and (max-width: 767px)
    width: 40%
  :deep .q-field--with-bottom
    padding: 0
  :deep .q-field__inner
    .q-field__bottom
      display: none
  :deep .q-field__control
    min-height: 35px
  :deep .q-field__native
    min-height: auto

.delimiter
  margin: 0
  color: $copper-grey-700
  @media screen and (max-width: 767px)
    display: none
</style>
