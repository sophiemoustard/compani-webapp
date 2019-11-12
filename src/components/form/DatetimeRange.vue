<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" error-message="Date(s) et heure(s) invalide(s)" borderless>
      <div class="datetime-container row justify-evenly items-center">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
          @blur="blurHandler" :disable="disable" @error="childErrors.startDate = $event" />
        <ni-time-input :value="value.startHour" @input="update($event, 'startHour')" class="time-item"
          @blur="blurHandler" :disable="disable" />
        <p class="delimiter">-</p>
        <ni-time-input :value="value.endHour" @input="update($event, 'endHour')" class="time-item"
          @blur="blurHandler" :disable="disable" :min="value.startHour" />
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          @blur="blurHandler" :min="value.startDate" :disable="disable || disableEndDate" />
      </div>
    </q-field>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import DateInput from './DateInput';
import TimeInput from './TimeInput';
import { minDate, validHour } from '../../helpers/vuelidateCustomVal.js';

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
  },
  validations () {
    return {
      value: {
        startDate: { required },
        startHour: { required, validHour },
        endDate: { required, minDate: minDate(this.value.startDate) },
        endHour: { required, validHour },
      },
    }
  },
  computed: {
    hasError () {
      if (this.error || this.$v.value.$error) return true;

      const startTime = this.value.startHour.split(':')
      const startDatetime = this.$moment(this.value.startDate).hours(startTime[0]).minutes(startTime[1]);
      const endTime = this.value.endHour.split(':')
      const endDatetime = this.$moment(this.value.endDate).hours(endTime[0]).minutes(endTime[1]);

      return startDatetime.isAfter(endDatetime);
    },
  },
  methods: {
    blurHandler () {
      this.$v.value.$touch();
      this.$emit('blur');
    },
    update (value, key) {
      const dates = { ...this.value, [key]: value }
      if (key === 'startDate') dates.endDate = value;
      if (key === 'startHour' && this.$moment(value, 'HH:mm').isSameOrAfter(this.$moment(this.value.endHour, 'HH:mm'))) {
        const startHour = this.$moment(value, 'HH:mm');
        const max = this.$moment(startHour).endOf('d');
        dates.endHour = this.$moment.min(startHour.add(2, 'H'), max).format('HH:mm');
      }

      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .datetime-container
    width: 100%
    border: 1px solid $light-grey;
    border-radius: 3px;
    @media screen and (min-width: 768px)
      flex-wrap: nowrap;

  /deep/ .q-field__control
    min-height: 40px
    .q-field__marginal.q-anchor--skip
      display: none

  .date-item
    @media screen and (min-width: 768px)
      width: 22%
    @media screen and (max-width: 767px)
      width: 50%
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
      width: 22%
    @media screen and (max-width: 767px)
      width: 50%
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
    color: $black
    @media screen and (max-width: 767px)
      display: none

</style>
