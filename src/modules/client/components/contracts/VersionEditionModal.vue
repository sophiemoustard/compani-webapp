<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Éditer le <span class="text-weight-bold">contrat</span>
    </template>
    <ni-input in-modal caption="Taux horaire" type="number" :error-message="grossHourlyRateError"
      :model-value="editedVersion.grossHourlyRate" :error="validations.grossHourlyRate.$error" suffix="€" required-field
      @update:model-value="update($event, 'grossHourlyRate')" @blur="validations.grossHourlyRate.$touch" />
    <ni-date-input :model-value="editedVersion.startDate" :min="minStartDate" :error="validations.startDate.$error"
      @update:model-value="update($event, 'startDate')" required-field @blur="validations.startDate.$touch"
      :error-message="startDateError" :class="[!validations.startDate.minDate && $q.platform.is.mobile && 'q-mb-sm']"
      in-modal caption="Date d'effet" />
    <div class="margin-input last">
      <q-checkbox dense :model-value="editedVersion.shouldBeSigned" label="Signature en ligne"
        @update:model-value="update($event, 'shouldBeSigned')" />
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['update:edited-version', 'hide', 'update:model-value', 'submit'],
  methods: {
    submit () {
      this.$emit('submit');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    hide () {
      this.$emit('hide');
    },
    update (event, prop) {
      this.$emit('update:edited-version', { ...this.editedVersion, [prop]: event });
    },
  },
};
</script>
