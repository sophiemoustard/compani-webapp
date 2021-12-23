<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Éditer le <span class="text-weight-bold">contrat</span>
    </template>
    <ni-input in-modal caption="Taux horaire" type="number" :error-message="grossHourlyRateError"
      :value="editedVersion.grossHourlyRate" :error="validations.grossHourlyRate.$error" suffix="€" required-field
      @input="update($event, 'grossHourlyRate')" @blur="validations.grossHourlyRate.$touch" />
    <ni-date-input :value="editedVersion.startDate" :min="minStartDate" :error="validations.startDate.$error" in-modal
      @input="update($event, 'startDate')" required-field @blur="validations.startDate.$touch" caption="Date d'effet"
      :error-message="startDateError" :class="[!validations.startDate.minDate && $q.platform.is.mobile && 'q-mb-sm']" />
    <div class="margin-input last">
      <q-checkbox dense :value="editedVersion.shouldBeSigned" label="Signature en ligne"
        @input="update($event, 'shouldBeSigned')" />
    </div>
    <template #footer>
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
    startDateError: { type: String, default: '' },
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
