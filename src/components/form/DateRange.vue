<template>
  <div class='col-12'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field dense borderless :error="error" :error-message="errorLabel">
      <div :class="{ 'borders': !borderless }" class="date-container">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item" />
        <p class="delimiter">-</p>
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          :min="value.startDate" />
      </div>
    </q-field>
  </div>
</template>

<script>
import DateInput from './DateInput.vue';
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    value: { type: Object, default: function () { return { startDate: this.$moment().startOf('d').toISOString(), endDate: this.$moment().endOf('d').toISOString() } } },
    requiredField: { type: Boolean, default: false },
    borderless: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
  },
  methods: {
    update (value, key) {
      const dates = { ...this.value, [key]: value }
      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .borders
    border: 1px solid $light-grey

  /deep/ .q-field__append
    .text-negative
      display: none
  /deep/ .q-field__bottom
    color: $secondary
    padding-top: 3px

  .date-container
    width: 100%
    border-radius: 3px
    display: flex
    flex-direction: row
    background-color: $white
    align-items: center
    & .delimiter
      margin: 0
  .date-item
    width: 50%
    display: flex
    justify-content: center
    /deep/ .q-field--with-bottom
      max-width: 150px
      padding-bottom: 0px
    /deep/ .q-field__bottom
      display: none
</style>
