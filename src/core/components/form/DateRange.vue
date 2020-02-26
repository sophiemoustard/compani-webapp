<template>
  <div class='col-12'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field dense borderless :error="error" :error-message="errorLabel">
      <div class="date-container justify-center items-center row">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item" @blur="blur" />
        <p class="delimiter">-</p>
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          :min="value.startDate" @blur="blur" />
      </div>
    </q-field>
  </div>
</template>

<script>
import DateInput from '@components/form/DateInput';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    value: {
      type: Object,
      default: function () {
        return {
          startDate: this.$moment().startOf('d').toISOString(),
          endDate: this.$moment().endOf('d').toISOString(),
        };
      },
    },
    requiredField: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
  },
  methods: {
    update (value, key) {
      this.$emit('input', { ...this.value, [key]: value });
    },
    blur () {
      this.$emit('blur');
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
    background-color: $white
    & .delimiter
      margin: 0
      color: $black
  .date-item
    max-width: 150px
    /deep/ .q-field--with-bottom
      padding-bottom: 0px
    /deep/ .q-field__bottom
      display: none
</style>
