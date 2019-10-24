<template>
  <div :class="{ 'col-12 col-md-6': !inModal, 'col-12': inModal }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-select dense borderless :value="value.fullAddress" @input="update" :error="error" :error-message="errorLabel"
      use-input @filter="searchAddress" fill-input hide-selected input-debounce="0" :options="options"
      :class="{ 'borders': inModal }" @blur="blurEvent" @focus="focusEvent" clearable :disable="disable" />
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'SearchAddress',
  props: {
    value: { type: Object, default: () => ({ street: '', zipCode: '', city: '', fullAddress: '' }) },
    caption: { type: String, default: 'Adresse' },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    error: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
  },
  data () {
    return {
      options: [],
    };
  },
  methods: {
    async searchAddress (terms, done) {
      try {
        if (!terms) return this.update();

        const res = await this.$axios.get('https://api-adresse.data.gouv.fr/search', { params: { q: terms } });
        this.options = res.data.features.sort((a, b) => b.properties.score - a.properties.score).map(result => {
          return {
            label: result.properties.label,
            fullAddress: result.properties.label,
            value: result.properties.label,
            street: result.properties.name,
            zipCode: result.properties.postcode,
            city: result.properties.city,
            location: result.geometry,
          }
        });
        done(this.options);
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    blurEvent () {
      this.$emit('blur');
    },
    focusEvent () {
      this.$emit('focus');
    },
    update (value) {
      if (!value) this.$emit('input', { street: '', zipCode: '', city: '', location: {}, fullAddress: '' })
      else this.$emit('input', this.$_.pick(value, ['fullAddress', 'street', 'city', 'zipCode', 'location']));
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-field__append
    .q-select__dropdown-icon
      display: none
    .q-spinner
      display: none
</style>
