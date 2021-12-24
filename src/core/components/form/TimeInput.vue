<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal }"
    class="input">
    <div class="row justify-between" v-if="caption">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-input dense bg-color="white" borderless :model-value="modelValue" @update:model-value="update" :readonly="locked"
      :error-message="errorMessage" :error="error" @blur="onBlur" :rules="['time']" mask="time" data-cy="time-input"
      :disable="disable && !locked" :class="{ borders: inModal }">
      <template #append>
        <q-icon v-if="!locked" name="far fa-clock" class="cursor-pointer" @click="selectTime = !selectTime"
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
        <q-icon v-else name="lock" class="cursor-pointer" @click="click" color="copper-500" />
      </template>
    </q-input>
  </div>
</template>

<script>
import { PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '@data/constants';
import moment from '@helpers/moment';

export default {
  name: 'NiTimeInput',
  emits: ['update:model-value', 'blur', 'lock-click'],
  data () {
    return {
      selectTime: false,
    };
  },
  props: {
    modelValue: { type: String, default: '' },
    min: { type: String, default: '' },
    inModal: { type: Boolean, default: false },
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: '' },
    disable: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
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
      this.$emit('update:model-value', value);
    },
    onBlur () {
      this.$emit('blur');
    },
    click () {
      this.$emit('lock-click');
    },
  },
};
</script>

<style lang="sass" scoped>
.q-list
  width: 100px

:deep .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input
  color: $copper-grey-900
</style>
