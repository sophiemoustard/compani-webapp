<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Éditer le <span class="text-weight-bold">contrat</span>
    </template>
    <ni-input in-modal caption="Taux horaire" type="number" suffix="€" required-field
      :value="editedVersion.grossHourlyRate" :error="validations.grossHourlyRate.$error"
      @input="update($event, 'grossHourlyRate')" @blur="validations.grossHourlyRate.$touch"
      :error-message="grossHourlyRateError" />
    <ni-date-input caption="Date d'effet" :value="editedVersion.startDate" :min="minStartDate"
      @input="update($event, 'startDate')" in-modal required-field @blur="validations.startDate.$touch"
      :error="validations.startDate.$error" />
    <div class="margin-input last">
      <q-checkbox dense :value="editedVersion.shouldBeSigned" label="Signature en ligne"
        @input="update($event, 'shouldBeSigned')" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Éditer le contrat" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';

export default {
  name: 'VersionEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedVersion: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    minStartDate: { type: String, default: '' },
    versionTemplate: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    grossHourlyRateError: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  methods: {
    submit () {
      this.$emit('submit');
    },
    input (event) {
      this.$emit('input', event);
    },
    hide () {
      this.$emit('hide');
    },
    update (event, prop) {
      this.$emit('update:editedVersion', { ...this.editedVersion, [prop]: event });
    },
  },
};
</script>
