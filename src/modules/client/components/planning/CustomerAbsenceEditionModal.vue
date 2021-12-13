<template>
  <q-dialog :value="customerAbsenceEditionModal" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header :selected-person="editedCustomerAbsence.customer" @close="close" />
        <div class="modal-subtitle">
          <q-btn rounded unelevated color="primary" label="Absence" />
        </div>
        <ni-select caption="Motif" :value="editedCustomerAbsence.absenceType" :options="customerAbsenceOptions"
          required-field @input="update($event, 'absenceType')" />
        <ni-datetime-range class="last" caption="Dates et heures de l'absence" :value="editedCustomerAbsence.dates"
          @input="update($event, 'dates')" @blur="validations.dates.$touch" disable-start-hour disable-end-hour
          required-field />
      </div>
      <q-btn class="modal-btn full-width" no-caps color="primary" :loading="loading" label="Editer l'absence"
        icon-right="check" @click="submit" />
    </div>
  </q-dialog>
</template>

<script>
import Select from '@components/form/Select';
import DatetimeRange from '@components/form/DatetimeRange';
import { CUSTOMER_ABSENCE_TYPES } from '@data/constants';
import PlanningModalHeader from './PlanningModalHeader';

export default {
  name: 'CustomerAbsenceEditionModal',
  components: {
    'ni-select': Select,
    'ni-planning-modal-header': PlanningModalHeader,
    'ni-datetime-range': DatetimeRange,
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
  },
};

</script>

<style lang="stylus" scoped>
  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
</style>
