<template>
  <q-dialog :value="customerAbsenceEditionModal" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header :selected-person="editedCustomerAbsence.customer" @close="close" />
        <div class="modal-subtitle">
          <q-btn rounded unelevated color="primary" label="Absence" />
          <ni-button class="q-mx-sm" icon="delete" color="copper-grey-400" @click="validateCustomerAbsenceDeletion" />
        </div>
        <ni-select caption="Motif" :value="editedCustomerAbsence.absenceType" :options="customerAbsenceOptions"
          required-field @input="update($event, 'absenceType')" />
      </div>
      <div class="q-mx-lg">
        <ni-date-range borders class="last" caption="Dates de l'absence" required-field
          :value="editedCustomerAbsence.dates" @input="update($event, 'dates')" @blur="validations.dates.$touch" />
      </div>
      <q-btn class="modal-btn full-width" no-caps color="primary" :loading="loading" label="Editer l'absence"
        icon-right="check" @click="submit" />
    </div>
  </q-dialog>
</template>

<script>
import Select from '@components/form/Select';
import DateRange from '@components/form/DateRange';
import NiButton from '@components/Button';
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
    'ni-button': NiButton,
  },
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
      this.$emit('update:editedCustomerAbsence', { ...this.editedCustomerAbsence, [prop]: event });
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
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette absence ?',
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
        if (e.msg) NotifyNegative('Erreur lors de la suppression de l\'absence bénéficiaire.');
      }
    },
  },
};

</script>

<style lang="stylus" scoped>
  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  /deep/ .date-container
    justify-content: flex-start;
</style>
