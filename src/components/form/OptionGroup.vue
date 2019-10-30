<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div v-if="displayCaption" class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field dense borderless :error="error" :error-label="errorLabel" class="col-12">
        <q-option-group :value="value" @input="inputHandler" @blur="blurHandler" :options="options" :readonly="readOnly"
          :type="type" :inline="inline" dense />
      </q-field>
    </div>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiOptionGroup',
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Array],
    last: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    displayCaption: { type: Boolean, default: true },
  },
  methods: {
    inputHandler (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
  },
}
</script>

<style lang="stylus" scoped>
  .required::after
    content: ' *'
  /deep/.q-option-group
    color: black !important
    .q-radio
      padding-bottom: 10px !important
      .q-radio__label
        font-size: 15px
</style>
