<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" :error-label="errorMessage" borderless>
      <div class="datetime-container">
        <div class="datetime-item">
          <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
            @blur="blurHandler" :disable="disable" @error="childErrors.startDate = $event" />
          <ni-select :value="value.startHour" @input="update($event, 'startHour')" class="time-item"
            @blur="blurHandler" :options="hoursOptions" filter :filter-placeholder="value.startHour"
            name="start-hour" :disable="disable" align="center" />
        </div>
        <p class="delimiter">-</p>
        <div class="datetime-item end">
          <ni-select :value="value.endHour" @input="update($event, 'endHour')" class="time-item" align="center"
            @blur="blurHandler" :options="endHourOptions" :disable="disable" @error="childErrors.endDate = $event" />
          <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
            @blur="blurHandler" :min="value.startDate" :disable="disable || disableEndDate" />
        </div>
      </div>
    </q-field>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import DateInput from './DateInput';
import Select from './Select';
import { PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '../../data/constants.js';
import { minDate, validHour } from '../../helpers/vuelidateCustomVal.js';

export default {
  components: {
    'ni-date-input': DateInput,
    'ni-select': Select,
  },
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    value: { type: Object, default: () => ({}) },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    disableEndDate: { type: Boolean, default: false },
  },
  data () {
    return {
      errorMessage: 'Date(s) et heure(s) invalide(s)',
      childErrors: {
        startDate: false,
        endDate: false,
      },
      blur: false,
    };
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
    hoursOptions () {
      const range = this.$moment.range(this.$moment().hours(PLANNING_VIEW_START_HOUR).minutes(0), this.$moment().hours(PLANNING_VIEW_END_HOUR).minutes(0));
      const hours = Array.from(range.by('hours'));
      const selectOptions = [];
      hours.map((hour) => {
        selectOptions.push({ label: hour.format('HH:mm'), value: hour.format('HH:mm') });
        if (hour.format('HH') !== `${PLANNING_VIEW_END_HOUR}`) selectOptions.push({ label: hour.minutes(30).format('HH:mm'), value: hour.minutes(30).format('HH:mm') });
      });
      return selectOptions;
    },
    hasError () {
      if (!this.blur) return false;

      if (this.error || Object.values(this.childErrors).indexOf(true) !== -1 ||
        this.$v.value.startDate.$error || this.$v.value.startHour.$error || this.$v.value.endDate.$error || this.$v.value.endHour.$error) {
        return true;
      }

      const startTime = this.value.startHour.split(':')
      const startDatetime = this.$moment(this.value.startDate).hours(startTime[0]).minutes(startTime[1]);
      const endTime = this.value.endHour.split(':')
      const endDatetime = this.$moment(this.value.endDate).hours(endTime[0]).minutes(endTime[1]);

      return startDatetime.isAfter(endDatetime);
    },
    endHourOptions () {
      return this.hoursOptions.map(option => {
        return { ...option, disable: this.$moment(option.value, 'HH:mm').isSameOrBefore(this.$moment(this.value.startHour, 'HH:mm')) }
      });
    },
  },
  methods: {
    blurHandler () {
      this.$v.value.$touch();
      this.$emit('blur');
      this.blur = true;
    },
    update (value, key) {
      this.blur = false;
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
  /deep/ .datetime-container
    height: 40px
    border: 1px solid $light-grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    @media screen and (min-width: 768px)
      & .delimiter
        padding: 10px 14px;
        margin: 0;
        width: 4%;
    @media screen and (max-width: 767px)
      flex-direction: column;
      & .delimiter
        display: none;

  /deep/ .q-field__control
    min-height: 40px

  .date-item
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__native
      min-height: 40px
    /deep/ .q-field__inner
      .q-field__bottom
        display: none
    /deep/ .q-field__control
      min-height: 35px
      height: 35px

  .time-item
    /deep/ .q-field__inner
      display: flex;
      flex-direction: row;
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__native
      min-height: 40px
    /deep/ .q-field__inner
      .q-field__bottom
        display: none
    /deep/ .q-field__control
      min-height: 35px
      height: 35px

  .datetime-item
    height: 40px
    display: flex;
    flex-direction: row;
    justify-content: center;
    &.end
      @media screen and (max-width: 767px)
        border-top: 1px solid $light-grey;
        flex-direction: row-reverse;
    /deep/ .q-field
      .q-field__inner
        input
          height: 40px

</style>
