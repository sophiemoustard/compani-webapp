<template>
  <q-page class="client-background q-pb-xl">
    <div class="title-padding">
      <h4>Avoirs</h4>
    </div>
    <ni-simple-table :data="creditNotes" :columns="creditNotesColumns" :pagination.sync="pagination"
      :loading="tableLoading">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions" v-if="props.row.origin === COMPANI">
                <q-btn flat round small color="grey" icon="edit"
                  @click.native="openCreditNoteEditionModal(props.row)" />
                <q-btn flat round small color="grey" icon="delete" :disable="!props.row.isEditable"
                  @click="validateCNDeletion(col.value, props.row)" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un avoir"
      @click="creditNoteCreationModal = true" :disable="tableLoading" />

    <!-- Credit note creation modal -->
    <credit-note-creation-modal v-model="creditNoteCreationModal" @submit="createNewCreditNote" :loading="loading"
      :customers-options="customersOptions" :third-party-payer-options="thirdPartyPayerOptions"
      :subscriptions-options="subscriptionsOptions" :credit-note-events-options="creditNoteEventsOptions"
      :validations="$v.newCreditNote" :min-and-max-dates="creationMinAndMaxDates" @get-events="getCreationEvents"
      :credit-note-events="creditNoteEvents" :start-date-error-message="setStartDateErrorMessage(this.$v.newCreditNote)"
      :has-linked-events.sync="hasLinkedEvents" @hide="resetCreationCreditNoteData" :new-credit-note="newCreditNote"
      :end-date-error-message="setEndDateErrorMessage(this.$v.newCreditNote, this.newCreditNote.events)" />

    <!-- Credit note edition modal -->
    <credit-note-edition-modal v-if="Object.keys(editedCreditNote).length > 0" @submit="updateCreditNote"
      v-model="creditNoteEditionModal" :edited-credit-note="editedCreditNote" :validations="$v.editedCreditNote"
      :subscriptions-options="subscriptionsOptions" :credit-note-events-options="creditNoteEventsOptions"
      :has-linked-events="hasLinkedEvents" :credit-note-events="creditNoteEvents" @hide="resetEditionCreditNoteData"
      @get-events="getEditionEvents" :min-and-max-dates="editionMinAndMaxDates" :loading="loading"
      :end-date-error-message="setEndDateErrorMessage(this.$v.editedCreditNote, this.editedCreditNote.events)"
      :start-date-error-message="setStartDateErrorMessage(this.$v.editedCreditNote)" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import get from 'lodash/get';
import Events from '@api/Events';
import Customers from '@api/Customers';
import CreditNotes from '@api/CreditNotes';
import SimpleTable from '@components/table/SimpleTable';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { COMPANI, REQUIRED_LABEL } from '@data/constants';
import { formatPrice, getLastVersion, formatIdentity } from '@helpers/utils';
import { strictPositiveNumber, minDate, maxDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { getStartOfDay, getEndOfDay } from '@helpers/date';
import CreditNoteEditionModal from 'src/modules/client/components/customers/billing/CreditNoteEditionModal';
import CreditNoteCreationModal from 'src/modules/client/components/customers/billing/CreditNoteCreationModal';

export default {
  name: 'CreditNotes',
  metaInfo: { title: 'Avoirs' },
  components: {
    'ni-simple-table': SimpleTable,
    'credit-note-edition-modal': CreditNoteEditionModal,
    'credit-note-creation-modal': CreditNoteCreationModal,
  },
  data () {
    return {
      loading: false,
      creditNoteCreationModal: false,
      creditNoteEditionModal: false,
      hasLinkedEvents: false,
      customersOptions: [],
      creditNoteEvents: [],
      newCreditNote: {
        customer: null,
        thirdPartyPayer: null,
        date: '',
        events: [],
        startDate: '',
        endDate: '',
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        exclTaxesTpp: 0,
        inclTaxesTpp: 0,
        subscription: null,
      },
      editedCreditNote: {},
      creditNotes: [],
      creditNotesColumns: [
        { name: 'number', label: '#', align: 'left', field: 'number' },
        {
          name: 'date',
          label: 'Date de l\'avoir',
          align: 'left',
          field: row => (row.date ? row.date : null),
          format: val => (val ? moment(val).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'startDate',
          label: 'Début',
          align: 'left',
          field: row => (row.startDate ? moment(row.startDate).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: row => (row.endDate ? moment(row.endDate).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => formatIdentity(row.customer.identity, 'Lf'),
        },
        {
          name: 'thirdPartyPayer',
          label: 'Tiers payeur',
          align: 'left',
          field: row => (row.thirdPartyPayer ? `${row.thirdPartyPayer.name}` : ''),
          style: 'max-width: 250px',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'left',
          field: row => (row.thirdPartyPayer ? row.exclTaxesTpp : row.exclTaxesCustomer),
          format: value => formatPrice(value),
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'left',
          field: row => (row.thirdPartyPayer ? row.inclTaxesTpp : row.inclTaxesCustomer),
          format: value => formatPrice(value),
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'date',
        descending: true,
      },
      tableLoading: false,
      COMPANI,
    };
  },
  watch: {
    hasLinkedEvents () {
      this.creditNoteEvents = [];
      this.newCreditNote.events = [];
      this.newCreditNote.subscription = null;
      this.newCreditNote.startDate = '';
      this.newCreditNote.endDate = '';
      this.newCreditNote.exclTaxesCustomer = 0;
      this.newCreditNote.inclTaxesCustomer = 0;
      this.$v.newCreditNote.startDate.$reset();
      this.$v.newCreditNote.endDate.$reset();
    },
    'newCreditNote.customer': function (value) {
      this.newCreditNote.thirdPartyPayer = null;
    },
    'newCreditNote.events': function (value) {
      const prices = this.computePrices(this.newCreditNote.events);
      this.newCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
      this.newCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
      this.newCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
      this.newCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
    },
    'editedCreditNote.events': function (value) {
      if (this.hasLinkedEvents) {
        const prices = this.computePrices(this.editedCreditNote.events);
        this.editedCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
        this.editedCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
        this.editedCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
        this.editedCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
      }
    },
    'newCreditNote.startDate': function (value) {
      if (value === null) {
        this.creditNoteEvents = [];
      }
    },
    'newCreditNote.endDate': function (value) {
      if (value === null) {
        this.creditNoteEvents = [];
      }
    },
  },
  async mounted () {
    this.tableLoading = true;
    await Promise.all([this.refreshCreditNotes(), this.refreshCustomersOptions()]);
    this.tableLoading = false;
  },
  validations () {
    const creditNoteValidation = {
      date: { required },
      customer: { required },
      events: { required: requiredIf(() => this.hasLinkedEvents) },
      subscription: { required: requiredIf(() => !this.hasLinkedEvents) },
      inclTaxesTpp: {},
      inclTaxesCustomer: {},
    };
    const newCreditNoteDateValidation = {
      startDate: {
        required: requiredIf(() => this.hasLinkedEvents),
        maxDate: this.creationMinAndMaxDates.maxStartDate ? maxDate(this.creationMinAndMaxDates.maxStartDate) : '',
      },
      endDate: {
        required: requiredIf(() => this.hasLinkedEvents),
        minDate: minDate(this.creationMinAndMaxDates.minEndDate || this.newCreditNote.startDate),
      },
    };
    const editedCreditNoteDateValidation = {
      startDate: {
        required: requiredIf(() => this.hasLinkedEvents),
        maxDate: this.editionMinAndMaxDates.maxStartDate ? maxDate(this.editionMinAndMaxDates.maxStartDate) : '',
      },
      endDate: {
        required: requiredIf(() => this.hasLinkedEvents),
        minDate: minDate(this.editionMinAndMaxDates.minEndDate || this.editedCreditNote.startDate),
      },
    };
    const inclTaxesValidation = { required, strictPositiveNumber };
    const newCreditNoteInclTaxesValidation = this.newCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };
    const editedCreditNoteInclTaxesValidation = this.editedCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };

    return {
      newCreditNote: { ...creditNoteValidation, ...newCreditNoteDateValidation, ...newCreditNoteInclTaxesValidation },
      editedCreditNote: {
        ...creditNoteValidation,
        ...editedCreditNoteDateValidation,
        ...editedCreditNoteInclTaxesValidation,
      },
    };
  },
  computed: {
    subscriptionsOptions () {
      let selectedCustomer;
      if (this.newCreditNote.customer) {
        selectedCustomer = this.customersOptions.find(cus => cus.value === this.newCreditNote.customer);
      }
      if (this.editedCreditNote.customer) {
        selectedCustomer = this.editedCreditNote.customer;
      }

      if (!selectedCustomer) return [];
      return selectedCustomer.subscriptions.map(sub => ({
        label: sub.service.name,
        value: sub._id,
      }));
    },
    creditNoteEventsOptions () {
      const creditNoteEvents = [...this.creditNoteEvents]
        .sort((e1, e2) => (new Date(e1.startDate)) - (new Date(e2.startDate)));

      return creditNoteEvents.map(cnEvent => ({
        label: `${moment(cnEvent.startDate).format('DD/MM/YYYY HH:mm')} - `
          + `${moment(cnEvent.endDate).format('HH:mm')}`,
        value: cnEvent.eventId,
      }));
    },
    thirdPartyPayerOptions () {
      let customer;
      if (this.creditNoteCreationModal) customer = this.newCreditNote.customer;
      if (this.creditNoteEditionModal) customer = this.editedCreditNote.customer;
      const selectedCustomer = this.customersOptions.find(cus => cus.value === customer);
      if (!selectedCustomer) return [];

      return selectedCustomer.thirdPartyPayers.map(tpp => ({
        label: tpp.name,
        value: tpp._id,
      }));
    },
    creationMinAndMaxDates () {
      return this.setMinAndMaxDates(this.newCreditNote.events);
    },
    editionMinAndMaxDates () {
      return this.setMinAndMaxDates(this.editedCreditNote.events);
    },
  },
  methods: {
    // Refresh data
    async refreshCustomersOptions () {
      try {
        this.customersOptions = [];
        const customers = await Customers.listWithBilledEvents();
        for (let i = 0, l = customers.length; i < l; i++) {
          this.customersOptions.push({
            subscriptions: customers[i].subscriptions,
            thirdPartyPayers: customers[i].thirdPartyPayers,
            label: formatIdentity(customers[i].identity, 'FL'),
            value: customers[i]._id,
          });
        }
      } catch (e) {
        this.customersOptions = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les bénéficiaires.');
      }
    },
    async refreshCreditNotes () {
      try {
        this.creditNotes = await CreditNotes.list();
      } catch (e) {
        this.creditNotes = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les avoirs.');
      }
    },
    formatEventsAsCreditNoteEvents (events) {
      let customer;
      if (this.newCreditNote.customer) {
        customer = this.customersOptions.find(cus => cus.value === this.newCreditNote.customer);
      } else if (this.editedCreditNote.customer) customer = this.editedCreditNote.customer;

      return events.map((event) => {
        const cnEvent = cloneDeep(event);
        const subscription = customer.subscriptions.find(sub => sub._id === cnEvent.subscription);
        cnEvent.eventId = event._id;
        cnEvent.serviceName = subscription.service.name;
        delete event._id;

        return cnEvent;
      });
    },
    async getEvents (creditNote, validations) {
      try {
        if (!this.hasLinkedEvents || !creditNote.customer || !creditNote.startDate || !creditNote.endDate ||
        validations.startDate.$error || validations.endDate.$error) return;

        let query = {
          startDate: creditNote.startDate,
          endDate: creditNote.endDate,
          customer: get(creditNote.customer, '_id') || creditNote.customer,
        };

        if (creditNote._id) query = { ...query, creditNoteId: creditNote._id };

        if (creditNote.thirdPartyPayer) {
          query.thirdPartyPayer = get(creditNote.thirdPartyPayer, '_id') || creditNote.thirdPartyPayer;
        } else if (creditNote.linkedCreditNote) {
          const linkedCreditNote = this.creditNotes.find(cd => cd._id === creditNote.linkedCreditNote);
          query.thirdPartyPayer = linkedCreditNote.thirdPartyPayer._id;
        }

        this.creditNoteEvents = this.formatEventsAsCreditNoteEvents(await Events.listForCreditNotes(query));
      } catch (e) {
        this.creditNoteEvents = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les évènements facturés de ce bénéficiaire.');
      }
    },
    getEditionEvents (field) {
      if (this.$v.editedCreditNote[field]) this.$v.editedCreditNote[field].$touch();
      this.getEvents(this.editedCreditNote, this.$v.editedCreditNote);
    },
    getCreationEvents (field) {
      if (this.$v.newCreditNote[field]) this.$v.newCreditNote[field].$touch();
      this.getEvents(this.newCreditNote, this.$v.newCreditNote);
    },
    setMinAndMaxDates (events) {
      if (events && events.length) {
        const eventsWithCreditNote = this.creditNoteEvents.filter(e => events.includes(e._id));
        const endDate = new Date(get(eventsWithCreditNote[eventsWithCreditNote.length - 1], 'endDate'));
        const startDate = new Date(get(eventsWithCreditNote[0], 'startDate'));

        return {
          maxStartDate: getEndOfDay(startDate).toString(),
          minEndDate: getStartOfDay(endDate).toString(),
        };
      }

      return { startDate: '', endDate: '' };
    },
    setStartDateErrorMessage (validations) {
      if (!validations.startDate.required) return REQUIRED_LABEL;

      if (!validations.startDate.maxDate) return 'Il y a des créneaux dans cet intervalle.';

      return REQUIRED_LABEL;
    },
    setEndDateErrorMessage (validations, events) {
      if (!validations.endDate.required) return REQUIRED_LABEL;

      if (!validations.endDate.minDate) {
        return events.length
          ? 'Il y a des créneaux dans cet intervalle.'
          : 'La date de fin ne peut être antérieure à la date de début.';
      }

      return REQUIRED_LABEL;
    },
    // Compute
    computePrices (eventIds) {
      let exclTaxesCustomer = 0; let inclTaxesCustomer = 0;
      let exclTaxesTpp = 0; let inclTaxesTpp = 0;
      if (this.creditNoteEvents) {
        const selectedEvents = this.creditNoteEvents.filter(ev => eventIds.includes(ev.eventId));
        for (let i = 0, l = selectedEvents.length; i < l; i++) {
          if (selectedEvents[i].bills.exclTaxesCustomer) {
            exclTaxesCustomer += selectedEvents[i].bills.exclTaxesCustomer;
            inclTaxesCustomer += selectedEvents[i].bills.inclTaxesCustomer;
          }
          if (selectedEvents[i].bills.exclTaxesTpp) {
            exclTaxesTpp += selectedEvents[i].bills.exclTaxesTpp;
            inclTaxesTpp += selectedEvents[i].bills.inclTaxesTpp;
          }
        }
      }

      return { exclTaxesCustomer, inclTaxesCustomer, exclTaxesTpp, inclTaxesTpp };
    },
    // Creation
    resetCreationCreditNoteData () {
      this.newCreditNote = {
        customer: null,
        date: '',
        events: [],
        startDate: '',
        endDate: '',
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        exclTaxesTpp: 0,
        inclTaxesTpp: 0,
        subscription: null,
        thirdPartyPayer: null,
      };
      this.creditNoteEvents = [];
      this.hasLinkedEvents = false;
      this.$v.newCreditNote.$reset();
    },
    formatPayloadWithSubscription (creditNote, customer) {
      const payload = {};
      const subscription = customer.subscriptions.find(sub => sub._id === creditNote.subscription);
      const { vat } = subscription.service;

      if (creditNote.inclTaxesCustomer) {
        payload.inclTaxesCustomer = creditNote.inclTaxesCustomer;
        payload.exclTaxesCustomer = Number.parseFloat((creditNote.inclTaxesCustomer / (1 + (vat / 100))).toFixed(2));
      } else {
        payload.inclTaxesTpp = creditNote.inclTaxesTpp;
        payload.exclTaxesTpp = Number.parseFloat((creditNote.inclTaxesTpp / (1 + (vat / 100))).toFixed(2));
        payload.thirdPartyPayer = creditNote.thirdPartyPayer;
      }

      payload.subscription = {
        _id: subscription._id,
        service: {
          serviceId: subscription.service._id,
          nature: subscription.service.nature,
          name: subscription.service.name,
        },
        vat,
        unitInclTaxes: subscription.versions && subscription.versions.length > 0
          ? getLastVersion(subscription.versions, 'createdAt').unitTTCRate
          : 0,
      };

      return payload;
    },
    formatCreditNoteEvents (creditNoteEvents, customer) {
      return creditNoteEvents.map((eventId) => {
        const cnEvent = this.creditNoteEvents.find(ev => ev.eventId === eventId);

        const event = pick(cnEvent, ['eventId', 'auxiliary', 'startDate', 'endDate', 'bills', 'serviceName']);
        event.bills = omit(event.bills, '_id');
        if (cnEvent.bills.surcharges) event.bills.surcharges = cnEvent.bills.surcharges.map(sur => omit(sur, '_id'));

        return event;
      });
    },
    formatPayloadWithLinkedEvents (creditNote, customer) {
      const payload = {
        startDate: creditNote.startDate,
        endDate: creditNote.endDate,
        exclTaxesCustomer: creditNote.exclTaxesCustomer,
        inclTaxesCustomer: creditNote.inclTaxesCustomer,
        exclTaxesTpp: creditNote.exclTaxesTpp,
        inclTaxesTpp: creditNote.inclTaxesTpp,
        thirdPartyPayer: creditNote.thirdPartyPayer,
      };

      if (creditNote.events.length > 0) {
        payload.events = this.formatCreditNoteEvents(creditNote.events, customer);
      }

      return payload;
    },
    formatPayload (creditNote) {
      const { date, customer } = creditNote;
      let payload = { date, customer };
      const selectedCustomer = customer._id
        ? customer
        : this.customersOptions.find(cus => cus.value === customer) || customer;

      if (!this.hasLinkedEvents) {
        payload = { ...payload, ...this.formatPayloadWithSubscription(creditNote, selectedCustomer) };
      } else {
        payload = { ...payload, ...this.formatPayloadWithLinkedEvents(creditNote, selectedCustomer) };
      }

      return pickBy(payload, prop => prop != null);
    },
    async createNewCreditNote () {
      try {
        this.$v.newCreditNote.$touch();

        if (this.$v.newCreditNote.$error || this.noEventSelectedForNewCreditNote) {
          return NotifyWarning('Champ(s) invalide(s)');
        }
        this.loading = true;
        await CreditNotes.create(this.formatPayload(this.newCreditNote));

        NotifyPositive('Avoir créé');
        await this.refreshCreditNotes();
        this.creditNoteCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'avoir.');
      } finally {
        this.loading = false;
      }
    },
    updateHasLinkedEvents (value) {
      this.hasLinkedEvents = value;
    },
    // Edition
    async openCreditNoteEditionModal (creditNote) {
      this.editedCreditNote = { inclTaxesCustomer: 0, inclTaxesTpp: 0, ...creditNote };
      this.editedCreditNote.customer = creditNote.customer;
      if (creditNote.thirdPartyPayer) this.editedCreditNote.thirdPartyPayer = creditNote.thirdPartyPayer;

      this.hasLinkedEvents = creditNote.events && creditNote.events.length > 0;
      if (this.hasLinkedEvents) {
        await this.getEvents(this.editedCreditNote, this.$v.editedCreditNote);
        this.editedCreditNote.events = creditNote.events.map(ev => ev.eventId);
      } else {
        this.editedCreditNote.subscription = creditNote.subscription._id;
      }

      this.creditNoteEditionModal = true;
    },
    resetEditionCreditNoteData () {
      this.creditNoteEditionModal = false;
      this.editedCreditNote = {};
      this.creditNoteEvents = [];
      this.hasLinkedEvents = false;
      this.$v.editedCreditNote.$reset();
    },
    async updateCreditNote () {
      try {
        this.$v.editedCreditNote.$touch();
        if (this.$v.editedCreditNote.$error || this.noEventSelectedForEditedCreditNote) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        this.loading = true;
        const payload = { ...this.formatPayload(this.editedCreditNote), customer: this.editedCreditNote.customer._id };
        if (this.editedCreditNote.thirdPartyPayer) payload.thirdPartyPayer = this.editedCreditNote.thirdPartyPayer._id;
        await CreditNotes.updateById(this.editedCreditNote._id, payload);

        NotifyPositive('Avoir modifié.');
        await this.refreshCreditNotes();
        this.creditNoteEditionModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'avoir.');
      } finally {
        this.loading = false;
      }
    },
    // Deletion
    async deleteCreditNote (id) {
      try {
        await CreditNotes.remove(id);
        await this.refreshCreditNotes();
        NotifyPositive('Avoir supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'avoir.');
      }
    },
    validateCNDeletion (id) {
      const deletedCreditNote = this.creditNotes.find(cd => cd._id === id);
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer cet avoir '
          + `${deletedCreditNote.linkedCreditNote ? 'et l\'avoir relié aux mêmes évènements' : ''} ?`,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteCreditNote(id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>
