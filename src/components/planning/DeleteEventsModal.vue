<template>
  <ni-modal :value="value" @hide="hide" @input="$emit('input', $event)">
    <template slot="title"> Suppression d'interventions sur une période </template>
    <ni-select in-modal caption="Bénéficiaire" v-model="deletedEvents.customer" :options="customersOptions"
      required-field @blur="$v.deletedEvents.customer.$touch"
      :error="$v.deletedEvents.customer.$error" />
    <ni-option-group :displayCaption="false" v-model="deletedEvents.isEndOfInterventions" type="radio"
      :options="deletetionOptions" inline />
    <template v-if="deletedEvents.isEndOfInterventions === 'betweenTwoDates'">
      <ni-date-input caption="Date de début" v-model="deletedEvents.startDate" type="date" required-field
        inModal @blur="$v.deletedEvents.startDate.$touch" :error="$v.deletedEvents.startDate.$error"/>
      <ni-date-input caption="Date de fin" v-model="deletedEvents.endDate" type="date" required-field inModal
        :min="deletedEvents.startDate" @blur="$v.deletedEvents.endDate.$touch" :error="$v.deletedEvents.endDate.$error"/>
    </template>
    <template v-if="deletedEvents.isEndOfInterventions === 'fromADate'">
      <ni-date-input caption="Date d'arrêt des interventions" v-model="deletedEvents.startDate" type="date"
        required-field inModal/>
    </template>
    <template slot="footer">
      <q-btn class="modal-btn full-width" color="primary" no-caps label="Valider la suppression" @click="deleteEvents"
      icon-right="clear" />
    </template>
  </ni-modal>
</template>
<script>
import { planningModalMixin } from '../../mixins/planningModalMixin';
import Modal from '../Modal';
import Select from '../form/Select';
import OptionGroup from '../form/OptionGroup';
import { NotifyNegative, NotifyPositive } from '../popup/notify';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { validationMixin } from '../../mixins/validationMixin.js';

export default {
  name: 'DeleteEventsModal',
  mixins: [planningModalMixin, validationMixin],
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
  },
  props: {
    value: { type: Boolean, default: false },
    customers: { type: Array, default: () => [] },
  },
  validations () {
    return {
      deletedEvents: {
        customer: { required },
        startDate: { required },
        endDate: { required: requiredIf((item, parent) => item.isEndOfInterventions === 'betweenTwoDates') },
      },
    }
  },
  data () {
    return {
      deletedEvents: { isEndOfInterventions: 'betweenTwoDates' },
      deletetionOptions: [
        { label: 'Entre deux dates', value: 'betweenTwoDates' },
        { label: 'A partir d\'une date', value: 'fromADate' },
      ],
    };
  },
  methods: {
    hide () {
      this.deletedEvents = { isEndOfInterventions: 'betweenTwoDates' };
      this.$emit('hide');
    },
    async deleteEvents () {
      await this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr de vouloir supprimer ces évènements ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(async () => {
        try {
          const isValid = await this.waitForFormValidation(this.$v.deletedEvents);
          if (!isValid) return NotifyNegative('Champ(s) invalide(s)');
          await this.$events.deleteManyEvents(this.$_.omit(this.deletedEvents, 'isEndOfInterventions'));
          this.$emit('hide');
          NotifyPositive('Les évènements ont bien étés supprimés');
        } catch (e) {
          console.warn(e);
          if (e.data.statusCode === 409) NotifyNegative('Vous n\'avez pas le droit de supprimer au moins l\'un des évènement');
          else NotifyNegative('Problème lors de la suppression');
        }
      }).onCancel(() => NotifyPositive('Suppression annulée'));
    },
  },
}

</script>
