<template>
  <ni-modal :value="value" @hide="hide" @input="$emit('input', $event)">
    <template slot="title">
      Suppression d'interventions sur une période
    </template>
    <ni-select in-modal caption="Bénéficiaire" v-model="deletedEvents.customer" :options="customersOptions"
      required-field />
    <ni-option-group v-model="isEndOfIntervention" type="radio" :options="deletetionOptions" inline />
    <template v-if="isEndOfIntervention === 'betweenTwoDates'">
      <ni-date-input caption="Date de début" v-model="deletedEvents.startDate" type="date" required-field
        inModal/>
      <ni-date-input caption="Date de fin" v-model="deletedEvents.endDate" type="date" required-field inModal
        :min="deletedEvents.startDate" />
    </template>
    <template v-if="isEndOfIntervention === 'fromADate'">
      <ni-date-input caption="Date d'arrêt des interventions" v-model="deletedEvents.startDate" type="date" required-field
        inModal/>
    </template>
    <template slot="footer">
      <q-btn class="modal-btn full-width" color="primary" no-caps label="Supprimer les évènements" @click="deleteEvents"
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

export default {
  name: 'DeleteEventsModal',
  mixins: [planningModalMixin],
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
  },
  props: {
    value: { type: Boolean, default: false },
    customers: { type: Array, default: () => [] },
  },
  data () {
    return {
      deletedEvents: {},
      isEndOfIntervention: 'betweenTwoDates',
      deletetionOptions: [
        { label: 'Entre deux dates', value: 'betweenTwoDates' },
        { label: 'A partir d\'une date', value: 'fromADate' },
      ],
    };
  },
  methods: {
    hide () {
      this.deletedEvents = {};
      this.$emit('hide');
    },
    async deleteEvents () {
      try {
        await this.$events.deleteManyEvents(this.deletedEvents);
        this.$emit('hide');
        NotifyPositive('Les évènements ont bien étés supprimés');
      } catch (e) {
        console.warn(e);
        NotifyNegative();
      }
    },
  },
}

</script>
