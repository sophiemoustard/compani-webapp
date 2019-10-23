<template>
  <div :class="{ 'col-12 col-md-6': !inModal, 'col-12': inModal }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <!-- <q-field :error="error" :error-label="errorLabel">
      <q-search :value="value.fullAddress" inverted-light color="white" placeholder=" " no-icon @input="update"
        @blur="blurEvent" @focus="focusEvent" :class="{'borders': inModal}" :disable="disable">
        <q-autocomplete @search="searchAddress" @selected="selectedAddress" @show="showEvent" />
      </q-search>
    </q-field> -->
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'SearchAddress',
  props: {
    value: { type: Object, default: () => ({ street: '', zipCode: '', city: '' }) },
    caption: { type: String, default: 'Adresse' },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    error: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
  },
  data () {
    return {
      addressObj: {
        street: '',
        zipCode: '',
        city: '',
        location: {},
      },
    };
  },
  methods: {
    async searchAddress (terms, done) {
      try {
        const res = await this.$axios.get('https://api-adresse.data.gouv.fr/search', {
          params: {
            q: terms,
          },
        });
        const resultsList = res.data.features.sort((a, b) => b.properties.score - a.properties.score).map(result => {
          return {
            label: result.properties.label,
            value: result.properties.label,
            street: result.properties.name,
            zipCode: result.properties.postcode,
            city: result.properties.city,
            location: result.geometry,
          }
        });
        done(resultsList);
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    inputEvent (value) {
      this.$emit('input', value);
    },
    selectedAddress (item) {
      const { label, value, ...payload } = item;
      this.inputEvent({ ...this.value, ...payload });
    },
    blurEvent () {
      this.$emit('blur');
    },
    focusEvent () {
      this.$emit('focus');
    },
    showEvent () {
      this.inputEvent({ ...this.addressObj, fullAddress: this.value.fullAddress });
    },
    update (value) {
      this.inputEvent({
        ...(value === '' ? this.addressObj : this.value),
        fullAddress: value,
      });
    },
  },
}
</script>

<style lang="stylus" scoped>
  .borders
    border: 1px solid $light-grey !important
</style>
