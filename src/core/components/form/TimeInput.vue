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
      <template v-slot:append>
        <q-icon name="far fa-clock" class="cursor-pointer icon-clock" @click.native="selectTime = !selectTime">
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
      const range = this.$moment.range(
        this.$moment().hours(PLANNING_VIEW_START_HOUR).minutes(0),
        this.$moment().hours(PLANNING_VIEW_END_HOUR).minutes(0)
      );
      const hours = Array.from(range.by('hours'));
      const selectOptions = [];
      hours.map((hour) => {
        selectOptions.push({
          label: hour.format('HH:mm'),
          value: hour.format('HH:mm'),
          disable: this.min !== '' && hour.isSameOrBefore(this.$moment(this.min, 'HH:mm')),
        });
        if (hour.format('HH') !== `${PLANNING_VIEW_END_HOUR}`) {
          selectOptions.push({
            label: hour.minutes(30).format('HH:mm'),
            value: hour.minutes(30).format('HH:mm'),
            disable: this.min !== '' && hour.minutes(30).isSameOrBefore(this.$moment(this.min, 'HH:mm')),
          });
        }
      });
      return selectOptions;
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
  .icon-clock
    font-size: 16px
    color: rgba(0,0,0,0.87)
  .q-list
    width: 100px
</style>
