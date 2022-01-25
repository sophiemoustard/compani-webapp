<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :model-value="model" :bg-color="bgColor" :options="selectableOptions" @filter="onFilter"
      :disable="disable" @focus="onFocus" @blur="onBlur" @update:model-value="onInput" behavior="menu" use-input
      :class="{ 'no-border': noBorder, 'borders': inModal && !noBorder , 'no-bottom': noError }" :error="error"
      :display-value="displayedValue" hide-selected fill-input :input-debounce="0" emit-value ref="selectInput"
      :option-disable="optionDisable" :data-cy="dataCy" :hide-dropdown-icon="!!icon" :error-message="errorMessage"
      :multiple="multiple">
      <template #append>
        <ni-button v-if="modelValue && !disable && clearable" icon="close" @click.stop="resetValue" size="sm" />
        <ni-button v-if="icon" :icon="icon" class="select-icon primary-icon"
          @click="$refs['selectInput'].showPopup()" />
      </template>
    <template #no-option>
      <slot name="no-option" />
    </template>
      <template v-if="optionSlot" #option="scope">
        <slot name="option" :scope="scope" />
      </template>
    </q-select>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';
import Button from '@components/Button';
import escapeRegExp from 'lodash/escapeRegExp';
import { removeDiacritics } from '@helpers/utils';

export default {
  name: 'NiSelect',
  props: {
    caption: { type: String, default: '' },
    icon: { type: String, default: null },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    options: { type: Array, default: () => [] },
    modelValue: { type: [String, Number, Object, Date], default: '' },
    requiredField: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    noError: { type: Boolean, default: false },
    bgColor: { type: String, default: 'white' },
    optionDisable: { type: String, default: 'disable' },
    dataCy: { type: String, default: '' },
    optionSlot: { type: Boolean, default: false },
    noBorder: { type: Boolean, default: false },
  },
  emits: ['focus', 'blur', 'update:model-value'],
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      selectableOptions: [],
    };
  },
  computed: {
    displayedValue () {
      const option = this.options.find(opt => opt.value === this.modelValue);
      return option ? option.label : '';
    },
    model () {
      return this.options.find(opt => opt.value === this.modelValue) || null;
    },
    formattedOptions () {
      return this.options.map(opt => ({
        ...opt,
        filters: [
          this.formatStringForFiltering(opt.label),
          ...(opt.additionalFilters
            ? opt.additionalFilters.map(additionalFilter => this.formatStringForFiltering(additionalFilter))
            : []
          ),
        ],
      }));
    },
  },
  methods: {
    onFocus () {
      this.$emit('focus');
    },
    onBlur () {
      this.$emit('blur');
    },
    onInput (val) {
      this.$emit('update:model-value', val);
      this.$refs.selectInput.blur();
    },
    formatStringForFiltering (str) {
      return escapeRegExp(removeDiacritics(str.toLowerCase()));
    },
    onFilter (val, update) {
      update(() => {
        if (val) {
          const formattedValue = this.formatStringForFiltering(val);
          this.selectableOptions = this.formattedOptions
            .filter(opt => opt.filters.some(word => word.includes(formattedValue)));
        } else {
          this.selectableOptions = this.options;
        }
      });
    },
    resetValue ($event) {
      this.onInput('');
      $event.preventDefault();
    },
  },
};
</script>

<style lang="sass" scoped>
.no-bottom
  padding-bottom: 0
  :deep(.q-field__bottom)
    display: none
.select-icon
  margin: 0

:deep(.q-field__native), :deep(.q-field__prefix), :deep(.q-field__suffix), :deep(.q-field__input)
  color: $copper-grey-900
</style>
