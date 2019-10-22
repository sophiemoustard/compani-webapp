<template>
  <div>
    <ni-select :inModal="inModal" caption="Type" required-field :value="formValue.nature" :options="natureOptions"
      @blur="onBlur('nature')" @input="update('nature', $event)" :error="$v.formValue.nature.$error"
      :errorLabel="getErrorLabel('nature')" />
    <ni-datetime-picker :inModal="inModal" caption="Date" required-field :value="formValue.date"
      @input="update('date', $event)" />
    <ni-input :inModal="inModal" caption="Document" required-field type="file" :value="formValue.file"
      @input="onBlur('file'); update('file', $event)" :error="$v.formValue.file.$error"
      :errorLabel="getErrorLabel('file')" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import find from 'lodash/find';

import { validationMixin } from '../../mixins/validationMixin.js';
import Select from '../form/Select';
import DatetimePicker from '../form/DatetimePicker';
import Input from '../form/Input';

export default {
  name: 'DocumentUpload',
  mixins: [validationMixin],
  components: {
    'ni-select': Select,
    'ni-datetime-picker': DatetimePicker,
    'ni-input': Input,
  },
  props: {
    natureOptions: { type: Array, default: () => [] },
    inModal: { type: Boolean, default: false },
    value: null,
  },
  data () {
    return {
      defaultValue: {
        nature: null,
        date: new Date(),
        file: null,
      },
      formValue: null,
      errorLabels: {
        maxSize: 'Fichier trop volumineux (> 5 Mo)',
      },
    };
  },
  created () {
    this.reset();
  },
  methods: {
    reset () {
      this.formValue = { ...this.defaultValue };
      this.$v.$reset();
      this.$emit('valid', false);
    },
    onBlur (field) {
      if (this.$v.formValue[field]) this.$v.formValue[field].$touch();
      this.$emit('blur');
    },
    async update (field, value) {
      this.formValue[field] = value;
      this.$emit('input', this.formValue);
      if (this.$v.formValue[field]) {
        await this.waitForFormValidation(this.$v.formValue[field]);
        this.$emit('valid', !this.$v.formValue.$invalid);
      }
    },
    getErrorLabel (field) {
      const validation = this.$v.formValue[field];
      const validatorKeys = Object.keys(validation.$params);
      const validatorKey = find(validatorKeys, key => !validation[key]);
      return this.errorLabels[validatorKey];
    },
    async validate () {
      this.$v.$touch()
      const isValid = await this.waitForFormValidation(this.$v.formValue);
      this.$emit('valid', isValid);
      return isValid;
    },
  },
  watch: {
    value () {
      if (this.value != null) {
        this.formValue = { ...this.value };
      } else {
        this.reset();
        this.$emit('input', this.formValue);
      }
    },
  },
  validations () {
    return {
      formValue: {
        nature: { required },
        file: { required, maxSize: file => !!file && file.size < 5000000 },
      },
    };
  },
}
</script>
