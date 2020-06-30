<template>
  <div>
    <ni-select :inModal="inModal" caption="Type" required-field :value="formValue.nature" :options="natureOptions"
      @blur="onBlur('nature')" @input="update('nature', $event)" :error="$v.formValue.nature.$error" />
    <ni-date-input :inModal="inModal" caption="Date" required-field :value="formValue.date"
      @input="update('date', $event)" />
    <ni-input :inModal="inModal" caption="Document" required-field type="file" :value="formValue.file"
      @input="onBlur('file'); update('file', $event)" :error="$v.formValue.file.$error"
      :error-message="fileErrorMessage" last />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants';
import { validationMixin } from 'src/modules/client/mixins/validationMixin.js';

export default {
  name: 'DocumentUpload',
  mixins: [validationMixin],
  components: {
    'ni-select': Select,
    'ni-date-input': DateInput,
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
        date: new Date().toISOString(),
        file: null,
      },
      formValue: null,
    };
  },
  validations () {
    return {
      formValue: {
        nature: { required },
        file: { required, maxSize: file => !file || file.size < 5000000 },
      },
    };
  },
  watch: {
    value () {
      if (this.value != null) this.formValue = { ...this.value };
      else {
        this.reset();
        this.$emit('input', this.formValue);
      }
    },
  },
  computed: {
    fileErrorMessage () {
      if (!this.$v.formValue.file.maxSize) return 'Fichier trop volumineux (> 5 Mo)';
      return REQUIRED_LABEL;
    },
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
    async validate () {
      this.$v.$touch()
      const isValid = await this.waitForFormValidation(this.$v.formValue);
      this.$emit('valid', isValid);
      return isValid;
    },
  },
}
</script>
