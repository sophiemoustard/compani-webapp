<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Créer une <span class="text-weight-bold">version</span>
    </template>
    <ni-input in-modal caption="Volume horaire hebdomadaire" :value="newVersion.weeklyHours" type="number"
      :error="validations.weeklyHours.$error" :error-message="weeklyHoursError" @input="update($event, 'weeklyHours')"
      @blur="validations.weeklyHours.$touch" suffix="h" required-field />
    <ni-input in-modal caption="Taux horaire" :error="validations.grossHourlyRate.$error" type="number" suffix="€"
      :value="newVersion.grossHourlyRate" required-field @input="update($event, 'grossHourlyRate')"
      @blur="validations.grossHourlyRate.$touch" :error-message="grossHourlyRateError" />
    <ni-date-input caption="Date d'effet" :error="validations.startDate.$error" :value="newVersion.startDate"
      :min="newVersionMinStartDate" in-modal required-field @input="update($event, 'startDate')"
      :error-message="startDateError" :class="[!validations.startDate.minDate && $q.platform.is.mobile && 'q-mb-sm']"
      @blur="validations.startDate.$touch" />
    <div class="row margin-input last">
      <div class="col-12">
        <q-checkbox dense :value="newVersion.shouldBeSigned" label="Signature en ligne"
          @input="update($event, 'shouldBeSigned')" />
      </div>
    </div>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';

export default {
  name: 'VersionCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newVersion: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    grossHourlyRateError: { type: String, default: '' },
    weeklyHoursError: { type: String, default: '' },
    newVersionMinStartDate: { type: String, default: '' },
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
      this.$emit('update:newVersion', { ...this.newVersion, [prop]: event });
    },
  },
};
</script>
