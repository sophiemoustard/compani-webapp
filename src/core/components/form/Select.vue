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
      :option-disable="optionDisable" :data-cy="dataCy">
      <template v-if="value && !disable" v-slot:append>
        <q-icon name="close" @click.stop="resetValue" class="cursor-pointer" size="16px" />
      </template>
      <template v-if="icon" v-slot:append>
        <q-icon :name="icon" class="select-icon pink-icon cursor-pointer" @click="$refs['selectInput'].showPopup()" />
      </template>
    </q-select>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'NiSelect',
  props: {
    caption: { type: String, default: '' },
    icon: { type: String, default: null },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    options: { type: Array, default: () => [] },
    value: [String, Number, Object],
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
    resetValue () {
      this.onInput(null);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .no-bottom
    padding-bottom: 0
    /deep/ .q-field__bottom
      display: none
  .select-icon
    margin: 0
</style>
