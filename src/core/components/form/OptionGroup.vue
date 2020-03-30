<template functional>
  <div :class="['row', 'margin-input', { last: props.last }]">
    <div class="col-12">
      <div v-if="props.displayCaption" class="row justify-between">
        <p :class="['input-caption', { required: props.requiredField }]">{{ props.caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field dense borderless :error="props.error" :error-label="props.errorLabel" class="col-12">
        <q-option-group v-on="listeners" :value="props.value" :options="props.options" :readonly="props.readOnly"
          :type="props.type" :inline="props.inline" dense :disable="props.disable" />
      </q-field>
    </div>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'NiOptionGroup',
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Array, Boolean],
    last: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    displayCaption: { type: Boolean, default: true },
    disable: { type: Boolean, default: false },
  },
}
</script>

<style lang="stylus" scoped>
  .required::after
    content: ' *'
  /deep/.q-option-group
    color: black !important
    .q-radio
      padding: 10px 0 !important
      .q-radio__label
        font-size: 15px

  /deep/ .q-field__control
    min-height: 25px !important
</style>
