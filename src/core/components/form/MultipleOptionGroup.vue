<template>
  <div :class="'row margin-input'">
    <div class="col-12">
      <div class="row justify-between">
        <p :class="'input-caption required'">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <div v-for="(options, index) in optionsGroups" :key="index">
        <div class="group-title">
          <q-icon :name="groupTitles[index].icon" size="sm" color="copper-grey-500" class="q-mr-xs" />
          <div class="text-weight-bold">{{ groupTitles[index].label }}</div>
        </div>
        <q-field dense borderless class="col-12">
          <q-option-group :value="value" :options="options" type="radio" inline dense
            v-on="$listeners" />
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
    optionsGroups: { type: Array, default: () => [] },
    groupTitles: { type: Array, default: () => [] },
  },
};
</script>

<style lang="sass" scoped>
  .error-field
    height: 0px
  .group-title
    display: flex
    flex: 1
    margin: 16px 0px 2px
  .required::after
    content: ' *'
  ::v-deep .q-option-group
    display: flex
    flex-direction: column
    color: $copper-grey-700 !important
    .q-radio
      padding: 10px 6px !important
      .q-radio__label
        font-size: 15px
  ::v-deep .q-field__control
    min-height: 25px !important
    border: 0
</style>
