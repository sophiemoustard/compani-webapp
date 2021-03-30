<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :value="model" :bg-color="bgColor" :options="innerOptions" :multiple="multiple"
      :disable="disable" @focus="onFocus" @blur="onBlur" @input="onInput" behavior="menu" @filter="onFilter"
      :class="{ 'borders': inModal, 'no-bottom': noError }" :error="error" :error-message="errorMessage" use-input
      :display-value="displayedValue" hide-selected fill-input :input-debounce="0" emit-value ref="selectInput"
      :option-disable="optionDisable" :data-cy="dataCy" :hide-dropdown-icon="!!icon">
      <template #append>
        <ni-button v-if="value && !disable" icon="close" @click.stop="resetValue" size="sm" />
        <ni-button v-if="icon" :icon="icon" class="select-icon pink-icon" @click="$refs['selectInput'].showPopup()" />
      </template>
    </q-select>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';
import Button from '@components/Button';

export default {
  name: 'NiSelect',
  props: {
    caption: { type: String, default: '' },
    icon: { type: String, default: null },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    options: { type: Array, default: () => [] },
    value: { type: [String, Number, Object, Date], default: '' },
    requiredField: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    noError: { type: Boolean, default: false },
    bgColor: { type: String, default: 'white' },
    optionDisable: { type: String, default: 'disable' },
    dataCy: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      innerOptions: [],
    };
  },
  computed: {
    displayedValue () {
      const option = this.options.find(opt => opt.value === this.value);
      return option ? option.label : '';
    },
    model () {
      return this.options.find(opt => opt.value === this.value) || null;
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
      this.$emit('input', val);
      this.$refs.selectInput.blur();
    },
    onFilter (val, update) {
      update(() => {
        if (val) {
          const value = val.toLowerCase();
          this.innerOptions = this.options.filter(opt => opt.label.toLowerCase().includes(value));
        } else {
          this.innerOptions = this.options;
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

<style lang="stylus" scoped>
  .no-bottom
    padding-bottom: 0
    /deep/ .q-field__bottom
      display: none
  .select-icon
    margin: 0
</style>
