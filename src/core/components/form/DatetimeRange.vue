<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" error-message="Date(s) et heure(s) invalide(s)" borderless>
      <div class="datetime-container row justify-evenly items-center">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
          @blur="blurHandler" :disable="disable" />
        <ni-time-input :value="startHour" @input="updateHours($event, 'startHour')" class="time-item"
          @blur="blurHandler" :disable="disable || disableStartHour" />
        <p class="delimiter">-</p>
        <ni-time-input :value="endHour" @input="updateHours($event, 'endHour')" class="time-item"
          @blur="blurHandler" :disable="disable || disableEndHour" :min="startHour" />
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          @blur="blurHandler" :min="value.startDate" :disable="disable || disableEndDate" />
      </div>
    </q-field>
  </div>
</template>

<script>
import pick from 'lodash/pick';
import { required } from 'vuelidate/lib/validators';
import DateInput from '@components/form/DateInput';
import TimeInput from '@components/form/TimeInput';
import { minDate } from '@helpers/vuelidateCustomVal.js';

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
    disableEndDate: { type: Boolean, default: false },
    disableEndHour: { type: Boolean, default: false },
    disableStartHour: { type: Boolean, default: false },
  },
  validations () {
    return {
      value: {
        startDate: { required },
        endDate: { required, minDate: minDate(this.value.startDate) },
      },
    }
  },
  computed: {
    hasError () {
      if (this.error || this.$v.value.$error) return true;

      return this.$moment(this.value.startDate).isAfter(this.$moment(this.value.endDate));
    },
    startHour () {
      return this.$moment(this.value.startDate).format('HH:mm');
    },
    endHour () {
      return this.$moment(this.value.endDate).format('HH:mm');
    },
  },
  methods: {
    blurHandler () {
      this.$v.value.$touch();
      this.$emit('blur');
    },
    setDateHours (date, hour) {
      const splitHour = hour.split(':');
      return this.$moment(date).set({
        hours: Number.parseInt(splitHour[0]),
        minutes: Number.parseInt(splitHour[1]),
        seconds: 0,
        milliseconds: 0,
      }).toISOString();
    },
    update (date, key) {
      const hoursFields = ['hours', 'minutes', 'seconds', 'milliseconds'];
      const dateObject = pick(this.$moment(this.value[key]).toObject(), hoursFields);
      const dates = {
        ...this.value,
        [key]: this.$moment(date).set({ ...dateObject }).toISOString(),
      }
      if (key === 'startDate' && this.disableEndDate) {
        const endDateObject = pick(this.$moment(this.value.endDate).toObject(), hoursFields);
        dates.endDate = this.$moment(date).set({ ...endDateObject }).toISOString();
      }
      if (key === 'endDate') dates.endDate = this.$moment(dates.endDate).endOf('d').toISOString();
      this.$emit('input', dates);
    },
    updateHours (value, key) {
      const dates = { ...this.value };
      if (key === 'endHour') dates.endDate = this.setDateHours(dates.endDate, value);
      if (key === 'startHour') {
        dates.startDate = this.setDateHours(dates.startDate, value);
        if (this.$moment(value, 'HH:mm').isSameOrAfter(this.$moment(this.endHour, 'HH:mm'))) {
          const max = this.$moment(dates.startDate).endOf('d')
          dates.endDate = this.$moment.min(this.$moment(dates.startDate).add(2, 'H'), max).toISOString();
        }
      }
      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .datetime-container
    width: 100%
    border: 1px solid $middle-grey;
    border-radius: 3px;
    @media screen and (min-width: 768px)
      flex-wrap: nowrap;

  /deep/ .q-field__control
    min-height: 40px
    .q-field__marginal.q-anchor--skip
      display: none

  .date-item
    @media screen and (min-width: 768px)
      width: 26%
    @media screen and (max-width: 767px)
      width: 60%
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__control
      min-height: 35px
    /deep/ .q-field__native
      min-height: auto
    /deep/ .q-field__inner
      .q-field__bottom
        display: none

  .time-item
    @media screen and (min-width: 768px)
      width: 18%
    @media screen and (max-width: 767px)
      width: 40%
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__inner
      .q-field__bottom
        display: none
    /deep/ .q-field__control
      min-height: 35px
    /deep/ .q-field__native
      min-height: auto

  .delimiter
    margin: 0
    color: black
    @media screen and (max-width: 767px)
      display: none
</style>
