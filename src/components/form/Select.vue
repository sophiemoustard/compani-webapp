<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :value="model" bg-color="white" :options="innerOptions" :multiple="multiple"
      behavior="menu" use-input :input-debounce="0" hide-selected fill-input emit-value :error="error"
      :disable="disable" @focus="onFocus" @blur="onBlur" @input="update" :class="{ 'borders': inModal }"
      :error-message="errorLabel" @filter="filter" />
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
    multiple: { type: Boolean, default: false },
  },
  data () {
    return {
      model: null,
      innerOptions: [],
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
  mounted () {
    this.model = this.options.find(opt => opt.value === this.value);
  },
  methods: {
    onFocus () {
      this.$emit('focus');
    },
    onBlur () {
      this.$emit('blur');
    },
    update (opt) {
      this.$emit('input', opt);
    },
    filter (term, done) {
      if (term) {
        const value = term.toLowerCase();
        this.innerOptions = this.options.filter(opt => opt.label.toLowerCase().includes(value));
      } else this.innerOptions = this.options
      done(this.innerOptions);
    },
  },
}
</script>
