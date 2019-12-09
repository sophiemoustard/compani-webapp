<template>
  <ni-modal :value="value" @hide="hide" @input="$emit('input', $event)" title="Suppression d'interventions sur une période">
    <ni-select in-modal caption="Bénéficiaire" v-model="deletedEvents.customer" :options="customersOptions"
      required-field @blur="$v.deletedEvents.customer.$touch"
      :error="$v.deletedEvents.customer.$error" />
    <ni-option-group :displayCaption="false" v-model="deletedEvents.inRange" type="radio"
      :options="deletetionOptions" inline />
    <template v-if="deletedEvents.inRange">
      <ni-date-input caption="Date de début" v-model="deletedEvents.startDate" type="date" required-field
        in-modal @blur="$v.deletedEvents.startDate.$touch" :error="$v.deletedEvents.startDate.$error"/>
      <ni-date-input caption="Date de fin" v-model="deletedEvents.endDate" type="date" required-field in-modal
        :min="deletedEvents.startDate" @blur="$v.deletedEvents.endDate.$touch" :error="$v.deletedEvents.endDate.$error"/>
    </template>
    <template v-else>
      <ni-date-input caption="Date d'arrêt des interventions" v-model="deletedEvents.startDate" type="date"
        required-field in-modal/>
    </template>
    <template slot="footer">
      <q-btn class="modal-btn full-width" color="primary" no-caps label="Supprimer les interventions" @click="validateEventsDeletion"
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
        endDate: { required: requiredIf((item) => item.inRange) },
      },
    }
  },
  data () {
    return {
      deletedEvents: { inRange: true },
      deletetionOptions: [
        { label: 'Entre deux dates', value: true },
        { label: 'A partir d\'une date', value: false },
      ],
    };
  },
  methods: {
    hide () {
      this.deletedEvents = { inRange: true };
      this.$v.deletedEvents.$reset();
      this.$emit('hide');
    },
    async validateEventsDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr de vouloir supprimer ces évènements ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteEvents())
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    async deleteEvents () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.deletedEvents);
        if (!isValid) return NotifyNegative('Champ(s) invalide(s)');
        await this.$events.deleteList(this.$_.omit(this.deletedEvents, 'inRange'));
        this.hide();
        NotifyPositive('Les évènements ont bien étés supprimés');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) NotifyNegative('Vous n\'avez pas le droit de supprimer au moins l\'un des évènements');
        else NotifyNegative('Problème lors de la suppression');
      }
    },
  },
}

</script>

<style lang="stylus" scoped>
/deep/ .q-option-group--inline
    .q-radio
      padding-bottom: 0px !important
</style>
