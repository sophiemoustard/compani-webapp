<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :value="model" bg-color="white" :options="innerOptions" :multiple="multiple"
      :disable="disable" @focus="onFocus" @blur="onBlur" @input="onInput" behavior="menu" @filter="onFilter"
      :class="{ 'borders': inModal, 'no-bottom': noError }" :error="error" :error-message="errorLabel" use-input
      :display-value="displayedValue" hide-selected fill-input :input-debounce="0" emit-value ref="selectInput">
        <template v-if="value && !disable" v-slot:append>
          <q-icon name="close" @click.stop="resetValue" class="cursor-pointer" size="16px" />
        </template>
        <template v-if="icon" v-slot:append>
          <q-icon :name="icon" class="select-icon pink-icon cursor-pointer"
            @click="$refs['selectInput'].showPopup()" />
        </template>
    </q-select>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiSelect',
  props: {
    caption: { type: String, default: '' },
    icon: { type: String, default: null },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    options: { type: Array, default: () => [] },
    value: [String, Number, Object],
    requiredField: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    noError: { type: Boolean, default: false },
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
    .q-field__bottom
      display: none
</style>
