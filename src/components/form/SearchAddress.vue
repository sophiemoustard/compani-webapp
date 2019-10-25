<template>
  <div :class="{ 'col-12 col-md-6': !inModal, 'col-12': inModal }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field dense :error="error" :error-message="errorLabel" borderless>
      <q-select dense borderless :value="value.fullAddress" @input="update" use-input fill-input hide-selected
        input-debounce="0" :options="options" :class="{ 'borders': inModal }" :disable="disable" @filter="searchAddress"
        @blur="blurEvent" @focus="focusEvent" bg-color="white" >
        <template v-if="value.fullAddress && !disable" v-slot:append>
          <q-icon name="close" @click.stop="resetValue" class="cursor-pointer" size="16px" />
        </template>
      </q-select>
    </q-field>
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
        if (!terms) return;

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
      this.$emit('input', this.$_.pick(value, ['fullAddress', 'street', 'city', 'zipCode', 'location']));
    },
    resetValue () {
      this.$emit('input', { street: '', zipCode: '', city: '', location: {}, fullAddress: '' });
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-select
    width: 100%

  /deep/ .q-field__append
    .q-select__dropdown-icon
      display: none
    .q-spinner
      display: none

  /deep/ .q-field__append
    .text-negative
      display: none
  /deep/ .q-field__bottom
    color: $secondary
    padding-top: 3px;
</style>
