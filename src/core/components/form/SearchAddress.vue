<template>
  <div :class="{ 'col-12 col-md-6': !inModal, 'col-12': inModal }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
      <q-select dense borderless :model-value="value.fullAddress" @update:model-value="update" use-input fill-input
        input-debounce="500" :options="options" :class="{ 'borders': inModal }" :disable="disable" behavior="menu"
        @filter="searchAddress" @blur="blurEvent" @focus="focusEvent" :bg-color="color" :error="error" hide-selected
        :error-message="errorMessage">
        <template v-if="value.fullAddress && !disable" #append>
          <ni-button icon="close" @click.stop="resetValue" size="sm" />
        </template>
      </q-select>
  </div>
</template>

<script>
import axios from 'axios';
import pick from 'lodash/pick';
import { REQUIRED_LABEL } from '@data/constants';
import Button from '@components/Button';

export default {
  name: 'SearchAddress',
  props: {
    value: { type: Object, default: () => ({ street: '', zipCode: '', city: '', fullAddress: '' }) },
    caption: { type: String, default: 'Adresse' },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    error: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    color: { type: String, default: 'white' },
  },
  emits: ['blur', 'focus', 'input'],
  components: {
    'ni-button': Button,
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

        const res = await axios.get('https://api-adresse.data.gouv.fr/search', { params: { q: terms } });
        this.options = res.data.features.sort((a, b) => b.properties.score - a.properties.score).map(result => ({
          label: result.properties.label,
          fullAddress: result.properties.label,
          value: result.properties.label,
          street: result.properties.name,
          zipCode: result.properties.postcode,
          city: result.properties.city,
          location: result.geometry,
        }));
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
      this.$emit('input', pick(value, ['fullAddress', 'street', 'city', 'zipCode', 'location']));
    },
    resetValue () {
      this.$emit('input', { street: '', zipCode: '', city: '', location: {}, fullAddress: '' });
    },
  },
};
</script>

<style lang="sass" scoped>
:deep .q-select
  width: 100%
  .q-select__dropdown-icon
    display: none
  .q-spinner
    display: none

:deep .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input
  color: $copper-grey-900
</style>
