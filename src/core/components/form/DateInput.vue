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
// TODO : verifier que ce n'est pas genant d'avoir changer l'ordre jour/mois/année
import { REQUIRED_LABEL, DD_MM_YYYY } from '@data/constants';
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
      return CompaniDate(this.modelValue).format(DD_MM_YYYY);
    },
    inputDate () {
      if (!this.modelValue) return '';
      return CompaniDate(this.modelValue).format(DD_MM_YYYY);
    },
  },
  methods: {
    dateOptions (date) {
      const dateValue = CompaniDate(date, DD_MM_YYYY);
      const isAfterMin = this.min ? dateValue.isSameOrAfter(this.min) : true;
      const isBeforeMax = this.max ? dateValue.isSameOrBefore(this.max) : true;

      return isAfterMin && isBeforeMax;
    },
    select (value) {
      try {
        const selectedDate = CompaniDate(value, DD_MM_YYYY);

        this.update(selectedDate.toISO());
        this.$refs.qDateMenu.hide();
        this.$refs.dateInput.blur();
      } catch (e) {
        console.error(e);
      }
    },
    input (value) {
      try {
        if (!value) return '';

        const date = CompaniDate(value, DD_MM_YYYY);
        this.update(date.toISO());
      } catch (e) {
        if (e.message.startsWith('Invalid DateTime: unparsable') ||
          e.message.startsWith('Invalid DateTime: unit out of range')) return '';
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
