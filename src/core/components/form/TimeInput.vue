<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal }"
    class="input">
    <div class="row justify-between" v-if="caption">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-input dense bg-color="white" borderless :value="value" @input="update" :class="{ borders: inModal }"
      :error-message="errorMessage" :error="error" :disable="disable" @blur="onBlur" :rules="['time']" mask="time"
      data-cy="time-input">
      <template #append>
        <q-icon name="far fa-clock" class="cursor-pointer" @click.native="selectTime = !selectTime"
          color="copper-grey-500">
          <q-menu ref="qTimeMenu" anchor="bottom right" self="top right">
            <q-list dense padding>
              <q-item v-for="(hour, index) in hoursOptions" :key="index" clickable @click="select(hour.value)"
                :disable="hour.disable">
                <q-item-section>{{ hour.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '@data/constants';
import moment from '@helpers/moment';

export default {
  name: 'NiTimeInput',
  data () {
    return {
      selectTime: false,
    };
  },
  props: {
    value: { type: String, default: '' },
    min: { type: String, default: '' },
    inModal: { type: Boolean, default: false },
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: '' },
    disable: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
  },
  computed: {
    hoursOptions () {
      const range = moment.range(
        moment().hours(PLANNING_VIEW_START_HOUR).minutes(0),
        moment().hours(PLANNING_VIEW_END_HOUR).minutes(0)
      );

      return Array.from(range.by('hours')).reduce(
        (acc, hour) => {
          acc.push({
            label: hour.format('HH:mm'),
            value: hour.format('HH:mm'),
            disable: this.min !== '' && hour.isSameOrBefore(moment(this.min, 'HH:mm')),
          });
          if (hour.format('HH') !== `${PLANNING_VIEW_END_HOUR}`) {
            acc.push({
              label: hour.minutes(30).format('HH:mm'),
              value: hour.minutes(30).format('HH:mm'),
              disable: this.min !== '' && hour.minutes(30).isSameOrBefore(moment(this.min, 'HH:mm')),
            });
          }
          return acc;
        },
        []
      );
    },
  },
  methods: {
    select (value) {
      this.update(value);
      this.$refs.qTimeMenu.hide();
    },
    update (value) {
      this.$emit('input', value);
    },
    onBlur () {
      this.$emit('blur');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .q-list
    width: 100px

  /deep/ .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input
    color: $copper-grey-900
</style>
