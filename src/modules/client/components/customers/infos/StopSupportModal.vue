<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      <span class="text-weight-bold">Arrêter</span> l'accompagnement
    </template>
    <ni-select in-modal :model-value="newStatus.stopReason" @update:model-value="update($event, 'stopReason')"
      @blur="validations.stopReason.$touch" :error="validations.stopReason.$error" required-field
      caption="Motif d'arrêt" :options="stopReasonOptions" />
    <ni-date-input :model-value="newStatus.stoppedAt" caption="Arrêt d'accompagnement à partir du..." in-modal
      @blur="validations.stoppedAt.$touch" :error="validations.stoppedAt.$error" :min="minDate" required-field
      @update:model-value="update($event, 'stoppedAt')" :error-message="stoppingDateErrorMessage" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Arrêter" icon-right="add" color="primary"
        :loading="loading" @click="validateSupportStopping" />
    </template>
  </ni-modal>
</template>

<script>

import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import { NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { SUPPORT_STOPPING_REASONS_OPTIONS, REQUIRED_LABEL } from '@data/constants';
import { formatDate, addDays } from '@helpers/date';

export default {
  name: 'StopSupportnModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newStatus: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    minDate: { type: String, required: true },
    stoppingDateErrorMessage: { type: String, default: REQUIRED_LABEL },
    customerName: { type: String, default: '' },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-status'],
  data () {
    return {
      stopReasonOptions: SUPPORT_STOPPING_REASONS_OPTIONS,
    };
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:new-status', { ...this.newStatus, [prop]: event });
    },
    validateSupportStopping () {
      this.validations.$touch();
      if (this.validations.$error) return NotifyWarning('Champ(s) invalide(s)');

      this.$q.dialog({
        title: 'Confirmation',
        message: `Êtes-vous sûr(e) de vouloir arrêter l'accompagnement&nbsp;?<br /><br />
        Toutes les interventions chez ${this.customerName} à partir du
        ${formatDate(addDays(this.newStatus.stoppedAt, 1))} seront supprimées et vous ne pourrez
        plus créer de nouvelles interventions à partir de cette date.`,
        html: true,
        ok: 'oui, arrêter l\'accompagnement',
        cancel: 'Non',
      })
        .onOk(this.submit)
        .onCancel(() => NotifyPositive('Arrêt de l\'accompagnement annulé.'));
    },
  },
};
</script>
