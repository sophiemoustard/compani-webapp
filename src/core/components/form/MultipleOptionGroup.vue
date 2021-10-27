<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <div v-for="(options, index) in optionsGroups" :key="index">
        <div class="group-title">
          <q-icon :name="groupTitles[index].icon" size="sm" color="copper-grey-500" class="q-mr-xs" />
          <div class="text-weight-bold">{{ groupTitles[index].label }}</div>
        </div>
        <q-field dense borderless class="col-12">
          <q-option-group :value="value" :options="options" :readonly="readOnly" :type="type" :inline="inline" dense
            :disable="disable" v-on="$listeners" />
        </q-field>
      </div>
      <q-field :error="error" :error-message="errorMessage" dense borderless class="error-field" />
    </div>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'NiMultipleOptionGroup',
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    value: { type: String, default: '' },
    last: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    optionsGroups: { type: Array, default: () => [] },
    groupTitles: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
  },
};
</script>

<style lang="stylus" scoped>
  .error-field
    height: 0px
  .group-title
    display: flex
    flex: 1
    margin: 16px 0px 2px
  .required::after
    content: ' *'
  /deep/.q-option-group
    display: flex
    flex-direction: column
    color: $copper-grey-700 !important
    .q-radio
      padding: 10px 6px !important
      .q-radio__label
        font-size: 15px
  /deep/ .q-field__control
    min-height: 25px !important
    border: 0
</style>
