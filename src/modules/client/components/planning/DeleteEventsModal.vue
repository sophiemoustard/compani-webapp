<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input"
    title="Suppression d'interventions sur une période">
    <ni-select in-modal caption="Bénéficiaire" v-model="deletedEvents.customer"
      :options="getCustomersOptions(deletedEvents.startDate)" required-field @blur="v$.deletedEvents.customer.$touch"
      :error="v$.deletedEvents.customer.$error" />
    <ni-option-group :display-caption="false" v-model="deletedEvents.inRange" type="radio"
      :options="deletetionOptions" inline />
    <template v-if="deletedEvents.inRange">
      <q-checkbox :model-value="isCustomerAbsence" label="Créer une absence bénéficiaire" dense class="q-mb-md"
        @update:model-value="allowCustomerAbsenceCreation" />
      <ni-select in-modal v-if="isCustomerAbsence" v-model="deletedEvents.absenceType" caption="Motif de l'absence"
        :options="customerAbsenceOptions" required-field @blur="v$.deletedEvents.absenceType.$touch"
        :error="v$.deletedEvents.absenceType.$error" />
      <ni-date-range caption="Dates de début et de fin" required-field v-model="deletedEvents" @blur="validateDates"
        :error="v$.deletedEvents.startDate.$error || v$.deletedEvents.endDate.$error" />
    </template>
    <template v-else>
      <ni-date-input caption="Date d'arrêt des interventions" v-model="deletedEvents.startDate" type="date"
        required-field in-modal />
    </template>
    <template #footer>
      <q-btn class="modal-btn full-width" color="primary" no-caps :loading="loading" label="Supprimer les interventions"
        @click="validateEventsDeletion" icon-right="close" />
    </template>
  </ni-modal>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Events from '@api/Events';
import Modal from '@components/modal/Modal';
import DateRange from '@components/form/DateRange';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { planningModalMixin } from 'src/modules/client/mixins/planningModalMixin';
import { validationMixin } from '@mixins/validationMixin';
import { LEAVE, HOSPITALIZATION, OTHER } from '@data/constants';

export default {
  name: 'DeleteEventsModal',
  setup () { return { v$: useVuelidate() }; },
  mixins: [planningModalMixin, validationMixin],
  emits: ['hide', 'update:model-value'],
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
    'ni-date-range': DateRange,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    customers: { type: Array, default: () => [] },
  },
  validations () {
    return {
      deletedEvents: {
        customer: { required },
        startDate: { required },
        endDate: { required: requiredIf(item => item.inRange) },
        absenceType: { required: requiredIf(() => this.isCustomerAbsence && this.deletedEvents.inRange) },
      },
    };
  },
  data () {
    return {
      deletedEvents: { inRange: true },
      deletetionOptions: [
        { label: 'Entre deux dates', value: true },
        { label: 'A partir d\'une date', value: false },
      ],
      loading: false,
      isCustomerAbsence: true,
      customerAbsenceOptions: [
        { label: 'Congés', value: LEAVE },
        { label: 'Hospitalisation', value: HOSPITALIZATION },
        { label: 'Autre', value: OTHER },
      ],
    };
  },
  watch: {
    'deletedEvents.inRange': function () {
      this.isCustomerAbsence = this.deletedEvents.inRange;
      this.deletedEvents = pick(this.deletedEvents, ['inRange', 'customer', 'startDate']);
    },
  },
  methods: {
    hide () {
      this.deletedEvents = { inRange: true };
      this.v$.deletedEvents.$reset();
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    validateEventsDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ces évènements ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteEvents)
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    allowCustomerAbsenceCreation () {
      this.isCustomerAbsence = !this.isCustomerAbsence;
      if (!this.isCustomerAbsence) this.deletedEvents = { ...omit(this.deletedEvents, 'absenceType') };
    },
    validateDates () {
      this.v$.deletedEvents.startDate.$touch();
      this.v$.deletedEvents.endDate.$touch();
    },
    async deleteEvents () {
      try {
        this.loading = true;
        this.v$.deletedEvents.$touch();
        const isValid = await this.waitForFormValidation(this.v$.deletedEvents);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        await Events.deleteList(omit(this.deletedEvents, 'inRange'));

        this.hide();

        if (this.isCustomerAbsence) return NotifyPositive('Absence bénéficiaire ajoutée.');
        NotifyPositive('Les évènements ont été supprimés.');
      } catch (e) {
        console.error(e);
        if ([409, 403].includes(e.status)) return NotifyNegative(e.data.message);
        NotifyNegative('Problème lors de la suppression.');
      } finally {
        this.loading = false;
      }
    },
  },
};

</script>

<style lang="sass" scoped>
:deep(.q-option-group--inline)
    .q-radio
      padding-bottom: 0px !important
</style>
