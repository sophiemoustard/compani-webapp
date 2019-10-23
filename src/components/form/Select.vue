<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :value="model" bg-color="white" inverted-light :options="options" :multiple="multiple"
      :display-value="displayedValue" :filter-placeholder="filterPlaceholder" :clearable="clearable" :disable="disable"
      @focus="onFocus" @blur="onBlur" @input="update" :class="{ 'borders': inModal }" :error="error"
      :error-message="errorLabel"/>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiSelect',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    options: Array,
    value: [String, Number, Object],
    requiredField: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    filterPlaceholder: { type: String, default: 'Rechercher' },
    disable: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  data () {
    return {
      model: null,
    };
  },
  computed: {
    displayedValue () {
      const option = this.options.find(opt => opt.value === this.value);
      return option ? option.label : '';
    },
  },
  watch: {
    value (value) {
      this.model = this.options.find(opt => opt.value === value);
    },
  },
  methods: {
    onFocus () {
      this.$emit('focus');
    },
    onBlur () {
      this.$emit('blur');
    },
    update (opt) {
      this.$emit('input', opt.value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .borders
    /deep/ .q-field__control
      border: 1px solid $light-grey
      border-radius: 3px

  /deep/ .q-select
    .q-field__inner
      height: 40px
    .q-field__control
      font-size: 16px
      padding-left: 14px
      padding-right: 14px
    .q-field__append
      .text-negative
        display: none
    .q-field__bottom
      color: $secondary
      padding-top: 3px;
</style>
