<template>
  <q-dialog :model-value="customerAbsenceEditionModal" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header :selected-person="editedCustomerAbsence.customer" @close="close" />
        <div class="modal-subtitle">
          <q-btn rounded unelevated color="primary" label="Absence" />
          <ni-button class="q-mx-sm" icon="delete" color="copper-grey-400" @click="validateCustomerAbsenceDeletion" />
        </div>
        <ni-select caption="Motif" :model-value="editedCustomerAbsence.absenceType" :options="customerAbsenceOptions"
          required-field @update:model-value="update($event, 'absenceType')" />
      </div>
      <div class="q-mx-lg">
        <ni-date-range borders class="last" caption="Dates de l'absence" @blur="validations.dates.$touch" in-modal
          :model-value="editedCustomerAbsence.dates" @update:model-value="update($event, 'dates')" required-field />
      </div>
      <q-btn class="modal-btn full-width" no-caps color="primary" :loading="loading" label="Editer l'absence"
        icon-right="check" @click="submit" />
    </div>
  </q-dialog>
</template>

<script>
import Select from '@components/form/Select';
import DateRange from '@components/form/DateRange';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import CustomerAbsences from '@api/CustomerAbsences';
import { CUSTOMER_ABSENCE_TYPES } from '@data/constants';
import PlanningModalHeader from './PlanningModalHeader';

export default {
  name: 'CustomerAbsenceEditionModal',
  components: {
    'ni-select': Select,
    'ni-planning-modal-header': PlanningModalHeader,
    'ni-date-range': DateRange,
    'ni-button': Button,
  },
  emits: ['update:edited-customer-absence', 'close', 'hide', 'submit'],
  data () {
    return {
      customerAbsenceOptions: CUSTOMER_ABSENCE_TYPES,
    };
  },
  props: {
    editedCustomerAbsence: { type: Object, default: () => ({}) },
    customerAbsenceEditionModal: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  methods: {
    update (event, prop) {
      this.$emit('update:edited-customer-absence', { ...this.editedCustomerAbsence, [prop]: event });
    },
    close () {
      this.$emit('close');
    },
    hide () {
      this.$emit('hide');
    },
    submit () {
      this.$emit('submit');
    },
    validateCustomerAbsenceDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette absence&nbsp;?',
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCustomerAbsence)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCustomerAbsence () {
      try {
        await CustomerAbsences.remove(this.editedCustomerAbsence._id);
        this.close();

        NotifyPositive('Absence supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'absence bénéficiaire.');
      }
    },
  },
};

</script>

<style lang="sass" scoped>
  .modal-subtitle
    display: flex
    justify-content: space-between
    margin-bottom: 16px
  :deep(.date-container)
    justify-content: flex-start
</style>
