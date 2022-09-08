<template>
  <div :class="contentClass">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-input borderless dense :model-value="inputDate" bg-color="white" @update:model-value="input" :error="error"
      :placeholder="placeholder" :disable="disable" :class="{ 'borders': inModal }" :error-message="errorMessage"
      @blur="blur" ref="dateInput" @focus="focus">
      <template #append>
        <q-icon name="event" class="cursor-pointer" @click="focus" color="copper-grey-500">
          <q-menu ref="qDateMenu" anchor="bottom right" self="top right">
            <q-date minimal :model-value="date" @update:model-value="select" :options="dateOptions"
              :disable="disable" />
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'NiDateInput',
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    modelValue: { type: String, default: '' },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
    disable: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    contentClass: { type: String, default: '' },
    placeholder: { type: String, default: 'jj/mm/yyyy' },
  },
  emits: ['blur', 'focus', 'update:model-value'],
  computed: {
    date () {
      if (!this.modelValue) return '';
      return CompaniDate(this.modelValue).format('yyyy/LL/dd');
    },
    inputDate () {
      if (!this.modelValue) return '';
      return CompaniDate(this.modelValue).format('dd/LL/yyyy');
    },
  },
  methods: {
    dateOptions (date) {
      let isBeforeMax = true;
      let isAfterMin = true;

      if (this.min) {
        const minDate = CompaniDate(this.min).format('yyyy/LL/dd');
        isAfterMin = CompaniDate(date).isSameOrAfter(minDate);
      }

      if (this.max) {
        const maxDate = CompaniDate(this.min).format('yyyy/LL/dd');
        isBeforeMax = CompaniDate(date).isSameOrBefore(maxDate);
      }
      return isAfterMin && isBeforeMax;
    },
    select (value) {
      try {
        const momentValue = CompaniDate(value, 'yyyy/LL/dd');
        if (!momentValue.isValid()) return;

        this.update(momentValue.toISO());
        this.$refs.qDateMenu.hide();
        this.$refs.dateInput.blur();
      } catch (e) {
        console.error(e);
      }
    },
    input (value) {
      try {
        if (!value) return this.update(value);

        const momentValue = CompaniDate(value, 'dd/LL/yyyy');
        this.update(momentValue.toISO());
      } catch (e) {
        console.error(e);
      }
    },
    update (value) {
      this.$emit('update:model-value', value);
    },
    blur () {
      this.$emit('blur');
    },
    focus () {
      this.$emit('focus');
    },
  },
};
</script>

<style lang="sass" scoped>
.q-input
  :deep(.q-field__control)
    font-size: 16px
    padding-left: 14px
    padding-right: 14px
    border-radius: 3px

:deep(.q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input)
  color: $copper-grey-900
</style>
