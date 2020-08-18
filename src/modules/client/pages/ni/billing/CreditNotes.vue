<template>
  <q-page class="client-background q-pb-xl">
    <div class="title-padding">
      <h4>Avoirs</h4>
    </div>
    <ni-large-table :data="creditNotes" :columns="creditNotesColumns" :pagination.sync="pagination"
      :loading="tableLoading">
      <template v-slot:body="{ props }">
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
    </ni-large-table>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un avoir"
      @click="creditNoteCreationModal = true" :disable="tableLoading" />

    <!-- Credit note creation modal -->
    <ni-modal v-model="creditNoteCreationModal" @hide="resetCreationCreditNoteData"
      container-class="modal-container-md">
      <template slot="title">
        Créer un <span class="text-weight-bold">avoir</span>
      </template>
      <ni-select in-modal caption="Bénéficiaire" v-model="newCreditNote.customer" :options="customersOptions"
        required-field @input="getEvents" @blur="$v.newCreditNote.customer.$touch"
        :error="$v.newCreditNote.customer.$error" use-input clearable />
      <ni-select in-modal caption="Tiers payeur" v-model="newCreditNote.thirdPartyPayer"
        :options="thirdPartyPayerOptions" @input="getEvents"
        :disable="thirdPartyPayerOptions.length === 0" clearable />
      <ni-date-input caption="Date de l'avoir" v-model="newCreditNote.date" :error="$v.newCreditNote.date.$error"
        @blur="$v.newCreditNote.date.$touch" in-modal type="date" required-field />
      <div class="row q-mb-md light">
        <q-toggle v-model="hasLinkedEvents" label="Lié à des interventions ?" />
      </div>
      <!-- Has linked events -->
      <template v-if="hasLinkedEvents">
        <ni-date-input caption="Début période concernée" v-model="newCreditNote.startDate"
          :error="$v.newCreditNote.startDate.$error" @blur="$v.newCreditNote.startDate.$touch" in-modal type="date"
          :disable="!hasLinkedEvents" @input="getEvents" required-field />
        <ni-date-input caption="Fin période concernée" v-model="newCreditNote.endDate"
          :error="$v.newCreditNote.endDate.$error" @blur="$v.newCreditNote.endDate.$touch" in-modal type="date"
          :disable="!hasLinkedEvents" @input="getEvents" required-field />
        <template v-if="creditNoteEvents.length > 0">
          <ni-option-group v-model="newCreditNote.events" :options="creditNoteEventsOptions" caption="Évènements"
            type="checkbox" required-field inline :error="$v.newCreditNote.events.$error" />
        </template>
        <div v-if="newCreditNoteHasNoEvents" class="light warning">
          <p>{{ eventsNotFoundMessage }}</p>
        </div>
        <div class="row justify-between items-baseline">
          <div class="col-6 light">
            <p v-if="newCreditNote.exclTaxesCustomer">
              Montant HT bénéficiaire :
              {{ formatPrice(newCreditNote.exclTaxesCustomer) }}
            </p>
            <p v-if="newCreditNote.exclTaxesTpp">
              Montant HT tiers-payeur : {{ formatPrice(newCreditNote.exclTaxesTpp) }}
            </p>
          </div>
          <div class="col-6 light">
            <p v-if="newCreditNote.inclTaxesCustomer">
              Montant TTC bénéficiaire :
              {{ formatPrice(newCreditNote.inclTaxesCustomer) }}
            </p>
            <p v-if="newCreditNote.inclTaxesTpp">
              Montant TTC tiers-payeur :
              {{ formatPrice(newCreditNote.inclTaxesTpp) }}
            </p>
          </div>
        </div>
      </template>
      <!-- Hasn't linked event -->
      <template v-else>
        <ni-select in-modal caption="Souscription concernée" :options="subscriptionsOptions"
          v-model="newCreditNote.subscription" :disable="!hasLinkedEvents && !newCreditNote.customer" required-field
          :error="$v.newCreditNote.subscription.$error" @blur="$v.newCreditNote.subscription.$touch" />
        <ni-input in-modal v-if="!newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          v-model="newCreditNote.inclTaxesCustomer" required-field :error="$v.newCreditNote.inclTaxesCustomer.$error"
          @blur="$v.newCreditNote.inclTaxesCustomer.$touch" :error-message="inclTaxesError" />
        <ni-input in-modal v-if="newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          v-model="newCreditNote.inclTaxesTpp" required-field :error="$v.newCreditNote.inclTaxesTpp.$error"
          @blur="$v.newCreditNote.inclTaxesTpp.$touch" :error-message="inclTaxesError" />
      </template>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary"
          :loading="loading" @click="createNewCreditNote" />
      </template>
    </ni-modal>

    <!-- Credit note edition modal -->
    <ni-modal v-if="Object.keys(editedCreditNote).length > 0" v-model="creditNoteEditionModal"
      @hide="resetEditionCreditNoteData" container-class="modal-container-md">
      <template slot="title">
        Editer un <span class="text-weight-bold">avoir</span>
      </template>
      <ni-input in-modal caption="Bénéficiaire" :value="formatIdentity(editedCreditNote.customer.identity, 'FL')"
        required-field disable />
      <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Tiers payeur"
        v-model="editedCreditNote.thirdPartyPayer.name" required-field disable />
      <ni-date-input caption="Date de l'avoir" v-model="editedCreditNote.date" in-modal type="date" required-field
        :error="$v.editedCreditNote.date.$error" @blur="$v.editedCreditNote.date.$touch"
        :disable="!editedCreditNote.isEditable" />
      <!-- Has linked events -->
      <template v-if="hasLinkedEvents">
        <ni-date-input caption="Début période concernée" v-model="editedCreditNote.startDate" in-modal type="date"
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" @input="getEvents" required-field
          :error="$v.editedCreditNote.startDate.$error" @blur="$v.editedCreditNote.startDate.$touch" />
        <ni-date-input caption="Fin période concernée" v-model="editedCreditNote.endDate" in-modal type="date"
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" @input="getEvents" required-field
          :error="$v.editedCreditNote.endDate.$error" @blur="$v.editedCreditNote.endDate.$touch" />
        <template v-if="creditNoteEvents.length > 0">
          <ni-option-group v-model="editedCreditNote.events" :options="creditNoteEventsOptions" caption="Évènements"
            type="checkbox" required-field inline :disable="!editedCreditNote.isEditable"
            :error="$v.editedCreditNote.events.$error" />
        </template>
        <div v-if="editedCreditNoteHasNoEvents" class="light warning">
          <p>{{ eventsNotFoundMessage }}</p>
        </div>
        <div class="row justify-between items-baseline">
          <div class="col-6 light">
            <p v-if="editedCreditNote.exclTaxesCustomer">
              Montant HT bénéficiaire :
              {{ formatPrice(editedCreditNote.exclTaxesCustomer) }}
            </p>
            <p v-if="editedCreditNote.exclTaxesTpp">
              Montant HT tiers-payeur :
              {{ formatPrice(editedCreditNote.exclTaxesTpp) }}
            </p>
          </div>
          <div class="col-6 light">
            <p v-if="editedCreditNote.inclTaxesCustomer">
              Montant TTC bénéficiaire :
              {{ formatPrice(editedCreditNote.inclTaxesCustomer) }}
            </p>
            <p v-if="editedCreditNote.inclTaxesTpp">
              Montant TTC tiers-payeur :
              {{ formatPrice(editedCreditNote.inclTaxesTpp) }}
            </p>
          </div>
        </div>
      </template>
      <!-- Hasn't linked event -->
      <template v-else>
        <ni-select in-modal caption="Souscription concernée" v-model="editedCreditNote.subscription"
          :options="subscriptionsOptions" :disable="!hasLinkedEvents && !editedCreditNote.customer" required-field
          :error="$v.editedCreditNote.subscription.$error" @blur="$v.editedCreditNote.subscription.$touch" />
        <ni-input in-modal v-if="!editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          v-model="editedCreditNote.inclTaxesCustomer" :error="$v.editedCreditNote.inclTaxesCustomer.$error"
          @blur="$v.editedCreditNote.inclTaxesCustomer.$touch" :error-message="inclTaxesError" required-field />
        <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€"
          v-model="editedCreditNote.inclTaxesTpp" required-field :error="$v.editedCreditNote.inclTaxesTpp.$error"
          @blur="$v.editedCreditNote.inclTaxesTpp.$touch" :error-message="inclTaxesError" type="number" />
      </template>
      <template v-if="editedCreditNote.isEditable" slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer l'avoir" icon-right="add" color="primary"
          :loading="loading" @click="updateCreditNote" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import Events from '@api/Events';
import Customers from '@api/Customers';
import CreditNotes from '@api/CreditNotes';
import LargeTable from '@components/table/LargeTable';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import { formatPrice, getLastVersion, formatIdentity } from '@helpers/utils';
import { COMPANI } from '@data/constants';

export default {
  name: 'CreditNotes',
  metaInfo: { title: 'Avoirs' },
  components: {
    'ni-date-input': DateInput,
    'ni-input': Input,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      eventsNotFoundMessage: 'Il n\'y a aucune intervention facturée pour le bénéficiaire aux dates données',
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
        {
          name: 'number',
          label: '#',
          align: 'left',
          field: 'number',
        },
        {
          name: 'date',
          label: 'Date de l\'avoir',
          align: 'left',
          field: row => (row.date ? row.date : null),
          format: val => (val ? this.$moment(val).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'startDate',
          label: 'Début',
          align: 'left',
          field: row => (row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : ''),
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: row => (row.endDate ? this.$moment(row.endDate).format('DD/MM/YYYY') : ''),
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
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
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
      startDate: { required: requiredIf(() => this.hasLinkedEvents) },
      endDate: { required: requiredIf(() => this.hasLinkedEvents) },
      events: { required: requiredIf(() => this.hasLinkedEvents) },
      subscription: { required: requiredIf(() => !this.hasLinkedEvents) },
      inclTaxesTpp: {},
      inclTaxesCustomer: {},
    };

    const inclTaxesValidation = { required, strictPositiveNumber };
    const newCreditNoteValidation = this.newCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };
    const editedCreditNoteValidation = this.editedCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };

    return {
      newCreditNote: { ...creditNoteValidation, ...newCreditNoteValidation },
      editedCreditNote: { ...creditNoteValidation, ...editedCreditNoteValidation },
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
        label: `${this.$moment(cnEvent.startDate).format('DD/MM/YYYY HH:mm')} - `
          + `${this.$moment(cnEvent.endDate).format('HH:mm')}`,
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
    inclTaxesError () {
      return 'Montant TTC non valide';
    },
    newCreditNoteHasNoEvents () {
      return this.newCreditNote.customer && this.newCreditNote.startDate && this.newCreditNote.endDate &&
        !this.creditNoteEvents.length;
    },
    editedCreditNoteHasNoEvents () {
      return this.editedCreditNote.customer && this.editedCreditNote.startDate && this.editedCreditNote.endDate &&
        !this.creditNoteEvents.length;
    },
  },
  methods: {
    formatPrice (value) {
      return formatPrice(value);
    },
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
    async getEvents () {
      try {
        if (this.hasLinkedEvents && this.newCreditNote.customer && this.newCreditNote.startDate &&
          this.newCreditNote.endDate) {
          const query = {
            startDate: this.newCreditNote.startDate,
            endDate: this.newCreditNote.endDate,
            customer: this.newCreditNote.customer,
            isBilled: true,
          };
          if (this.newCreditNote.thirdPartyPayer) query.thirdPartyPayer = this.newCreditNote.thirdPartyPayer;
          this.creditNoteEvents = this.formatEventsAsCreditNoteEvents(await Events.listForCreditNotes(query));
        } else if (this.hasLinkedEvents && this.editedCreditNote.customer && this.editedCreditNote.startDate &&
          this.editedCreditNote.endDate) {
          const query = {
            startDate: this.editedCreditNote.startDate,
            endDate: this.editedCreditNote.endDate,
            customer: this.editedCreditNote.customer._id,
            isBilled: true,
          };
          if (this.editedCreditNote.thirdPartyPayer) query.thirdPartyPayer = this.editedCreditNote.thirdPartyPayer._id;
          else if (this.editedCreditNote.linkedCreditNote) {
            const creditNote = this.creditNotes.find(cd => cd._id === this.editedCreditNote.linkedCreditNote);
            query.thirdPartyPayer = creditNote.thirdPartyPayer._id;
          }
          this.creditNoteEvents = this.formatEventsAsCreditNoteEvents(await Events.listForCreditNotes(query));
        }
      } catch (e) {
        this.creditNoteEvents = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les évènements facturés de ce bénéficiaire.');
      }
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
    // Edition
    async openCreditNoteEditionModal (creditNote) {
      this.editedCreditNote = { inclTaxesCustomer: 0, inclTaxesTpp: 0, ...creditNote };
      this.editedCreditNote.customer = creditNote.customer;
      if (creditNote.thirdPartyPayer) this.editedCreditNote.thirdPartyPayer = creditNote.thirdPartyPayer;

      this.hasLinkedEvents = creditNote.events && creditNote.events.length > 0;
      if (this.hasLinkedEvents) {
        await this.getEvents();
        for (let i = 0, l = creditNote.events.length; i < l; i++) {
          if (!this.creditNoteEvents.some(event => creditNote.events[i].eventId === event.eventId)) {
            this.creditNoteEvents.push(creditNote.events[i]);
          }
        }
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
    formatIdentity,
  },
};
</script>

<style lang="stylus" scoped>
  .light
    font-size: 14px;

  .warning
    color: $red;
</style>
