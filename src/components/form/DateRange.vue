<template>
  <div class='col-12'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <div class="date-container" :class="{ borderless: borderless }">
      <div class="date-item">
        <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item" />
      </div>
      <p class="delimiter">-</p>
      <div class="date-item">
        <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
          :min="value.startDate" />
      </div>
    </div>
  </div>
</template>

<script>
import DateInput from './DateInput.vue';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    value: { type: Object, default: function () { return { startDate: this.$moment().startOf('d').toISOString(), endDate: this.$moment().endOf('d').toISOString() } } },
    requiredField: { type: Boolean, default: false },
    borderless: { type: Boolean, default: false },
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
  .date-container
    border: 1px solid $light-grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    background-color: $white;
    align-items: center
    & .delimiter
      margin: 0;
  .date-item
    max-width: 150px
    /deep/ .q-field--with-bottom
      padding-bottom: 0px
    /deep/ .q-field__bottom
      display: none
</style>
