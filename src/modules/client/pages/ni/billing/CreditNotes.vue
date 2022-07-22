<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Avoirs" padding />
    <ni-simple-table :data="creditNotes" :columns="creditNotesColumns" v-model:pagination="pagination"
      :loading="tableLoading">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions" v-if="props.row.origin === COMPANI">
                <ni-button icon="edit" :disable="!!props.row.customer.archivedAt"
                  @click="openCreditNoteEditionModal(props.row)" />
                <ni-button icon="delete" :disable="!props.row.isEditable || !!props.row.customer.archivedAt"
                  @click="validateCNDeletion(col.value, props.row)" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
    <q-btn class="fixed fab-custom" no-caps rounded icon="add" label="Créer un avoir" :disable="tableLoading"
      @click="creditNoteCreationModal = true" color="primary" />

    <!-- Credit note creation modal -->
    <credit-note-creation-modal v-model="creditNoteCreationModal" @submit="createNewCreditNote"
      v-model:credit-note-type="creditNoteType" :third-party-payer-options="thirdPartyPayerOptions" :loading="loading"
      :subscriptions-options="subscriptionsOptions" :credit-note-events-options="creditNoteEventsOptions"
      :validations="v$.newCreditNote" :min-and-max-dates="creationMinAndMaxDates" @get-events="getCreationEvents"
      :credit-note-events="creditNoteEvents" :start-date-error-message="setStartDateErrorMessage(this.v$.newCreditNote)"
      :customers-options="customersOptions" @hide="resetCreationCreditNoteData" v-model:new-credit-note="newCreditNote"
      :end-date-error-message="setEndDateErrorMessage(this.v$.newCreditNote, this.newCreditNote.events)"
      @reset-customer-data="resetCustomerData" :billing-items-options="billingItemsOptions"
      @add-billing-item="addBillingItem" @update-billing-item="updateBillingItem"
      @remove-billing-item="removeBillingItem" />

    <!-- Credit note edition modal -->
    <credit-note-edition-modal v-if="Object.keys(editedCreditNote).length > 0" @submit="updateCreditNote"
      v-model="creditNoteEditionModal" v-model:edited-credit-note="editedCreditNote" :validations="v$.editedCreditNote"
      :subscriptions-options="subscriptionsOptions" :credit-note-events-options="creditNoteEventsOptions"
      :credit-note-type="creditNoteType" :credit-note-events="creditNoteEvents" @hide="resetEditionCreditNoteData"
      @get-events="getEditionEvents" :min-and-max-dates="editionMinAndMaxDates" :loading="loading"
      :end-date-error-message="setEndDateErrorMessage(this.v$.editedCreditNote, this.editedCreditNote.events)"
      :start-date-error-message="setStartDateErrorMessage(this.v$.editedCreditNote)" @add-billing-item="addBillingItem"
      :billing-items-options="billingItemsOptions" @update-billing-item="updateBillingItem"
      @remove-billing-item="removeBillingItem" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { required, requiredIf, helpers } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import set from 'lodash/set';
import BillingItems from '@api/BillingItems';
import Events from '@api/Events';
import Customers from '@api/Customers';
import CreditNotes from '@api/CreditNotes';
import TitleHeader from '@components/TitleHeader';
import Button from '@components/Button';
import SimpleTable from '@components/table/SimpleTable';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { COMPANI, REQUIRED_LABEL, SUBSCRIPTION, EVENTS, MANUAL, BILLING_ITEMS } from '@data/constants';
import { formatPrice, formatStringToPrice, getLastVersion, formatIdentity, formatAndSortOptions } from '@helpers/utils';
import { strictPositiveNumber, minDate, maxDate, positiveNumber, fractionDigits } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { getStartOfDay, getEndOfDay, formatDate } from '@helpers/date';
import { divide, add, multiply, isEqualTo, toString, toFixedToFloat } from '@helpers/numbers';
import CreditNoteEditionModal from 'src/modules/client/components/customers/billing/CreditNoteEditionModal';
import CreditNoteCreationModal from 'src/modules/client/components/customers/billing/CreditNoteCreationModal';

export default {
  name: 'CreditNotes',
  components: {
    'ni-title-header': TitleHeader,
    'ni-button': Button,
    'ni-simple-table': SimpleTable,
    'credit-note-edition-modal': CreditNoteEditionModal,
    'credit-note-creation-modal': CreditNoteCreationModal,
  },
  setup () {
    const metaInfo = { title: 'Avoirs' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  data () {
    return {
      loading: false,
      creditNoteCreationModal: false,
      creditNoteEditionModal: false,
      hasLinkedEvents: false,
      creditNoteType: SUBSCRIPTION,
      customersOptions: [],
      creditNoteEvents: [],
      billingItems: [],
      billingItemsOptions: [],
      newCreditNote: {
        customer: '',
        thirdPartyPayer: '',
        date: '',
        events: [],
        startDate: '',
        endDate: '',
        exclTaxesCustomer: toString(0),
        inclTaxesCustomer: 0,
        exclTaxesTpp: toString(0),
        inclTaxesTpp: 0,
        subscription: '',
        misc: '',
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
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
          format: formatDate,
        },
        { name: 'startDate', label: 'Début', align: 'left', field: 'startDate', format: formatDate },
        { name: 'endDate', label: 'Fin', align: 'left', field: 'endDate', format: formatDate },
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
          field: row => get(row, 'thirdPartyPayer.name') || '',
          style: 'max-width: 250px',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'left',
          field: row => (row.thirdPartyPayer ? row.exclTaxesTpp : row.exclTaxesCustomer),
          format: formatStringToPrice,
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'left',
          field: row => (row.thirdPartyPayer ? row.inclTaxesTpp : row.inclTaxesCustomer),
          format: formatPrice,
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      pagination: { rowsPerPage: 0, sortBy: 'date', descending: true },
      tableLoading: false,
      COMPANI,
    };
  },
  watch: {
    creditNoteType () {
      this.resetCustomerData();
    },
    'newCreditNote.customer': function (previousValue, currentValue) {
      if (isEqual(previousValue, currentValue)) return;
      this.newCreditNote.thirdPartyPayer = null;
    },
    'newCreditNote.events': function (previousValue, currentValue) {
      if (isEqual(previousValue, currentValue)) return;

      const prices = this.computePrices(this.newCreditNote.events, this.newCreditNote.customer);
      this.newCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
      this.newCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
      this.newCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
      this.newCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
    },
    'newCreditNote.billingItemList': {
      deep: true,
      handler () {
        if (get(this.newCreditNote, 'billingItemList[0].billingItem')) {
          this.newCreditNote.exclTaxesCustomer = this.newCreditNote.billingItemList.reduce(
            (acc, bi) => {
              const inclTaxes = multiply(bi.unitInclTaxes, bi.count);
              const biExclTaxes = this.getExclTaxes(toFixedToFloat(inclTaxes), bi.vat);
              return bi.billingItem ? add(acc, biExclTaxes) : acc;
            },
            toString(0)
          );

          const inclTaxesCustomerString = this.newCreditNote.billingItemList.reduce(
            (acc, bi) => {
              const biInclTaxes = toFixedToFloat(multiply(bi.unitInclTaxes, bi.count));
              return bi.billingItem ? add(acc, biInclTaxes) : acc;
            },
            toString(0)
          );
          this.newCreditNote.inclTaxesCustomer = toFixedToFloat(inclTaxesCustomerString);
        }
      },
    },
    'editedCreditNote.events': function (previousValue, currentValue) {
      if (!isEqual(previousValue, currentValue) && this.creditNoteType === EVENTS) {
        const prices = this.computePrices(this.editedCreditNote.events, this.editedCreditNote.customer._id);
        this.editedCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
        this.editedCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
        this.editedCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
        this.editedCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
      }
    },
    'editedCreditNote.billingItemList': {
      deep: true,
      handler () {
        if (get(this.editedCreditNote, 'billingItemList[0].billingItem')) {
          this.editedCreditNote.exclTaxesCustomer = this.editedCreditNote.billingItemList.reduce(
            (acc, bi) => {
              const biExclTaxes = this.getExclTaxes(multiply(bi.unitInclTaxes, bi.count), bi.vat);
              return bi.billingItem ? add(acc, biExclTaxes) : acc;
            },
            toString(0)
          );

          const inclTaxesCustomerString = this.editedCreditNote.billingItemList.reduce(
            (acc, bi) => {
              const biInclTaxes = multiply(bi.unitInclTaxes, bi.count);
              return bi.billingItem ? add(acc, biInclTaxes) : acc;
            },
            toString(0)
          );
          this.editedCreditNote.inclTaxesCustomer = toFixedToFloat(inclTaxesCustomerString);
        }
      },
    },
  },
  async mounted () {
    this.tableLoading = true;
    await Promise.all([this.refreshCreditNotes(), this.refreshCustomersOptions(), this.refreshBillingItemsOptions()]);
    this.tableLoading = false;
  },
  validations () {
    const creditNoteValidation = {
      date: { required },
      customer: { required },
      events: { required: requiredIf(this.creditNoteType === EVENTS) },
      subscription: { required: requiredIf(this.creditNoteType === SUBSCRIPTION) },
      inclTaxesTpp: {},
      inclTaxesCustomer: {},
      billingItemList: {
        required: requiredIf(this.creditNoteType === BILLING_ITEMS),
        ...(this.creditNoteType === BILLING_ITEMS && {
          $each: helpers.forEach({
            billingItem: { required },
            unitInclTaxes: { positiveNumber, required, fractionDigits: fractionDigits(2) },
            count: { strictPositiveNumber, required, fractionDigits: fractionDigits(3) },
          }),
        }),
      },
    };
    const newCreditNoteDateValidation = this.datesValidations(this.creationMinAndMaxDates, this.newCreditNote);
    const editedCreditNoteDateValidation = this.datesValidations(this.editionMinAndMaxDates, this.editedCreditNote);
    const inclTaxesValidation = { required, strictPositiveNumber, fractionDigits: fractionDigits(2) };
    const newCreditNoteInclTaxesValidation = this.newCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };
    const editedCreditNoteInclTaxesValidation = this.editedCreditNote.thirdPartyPayer
      ? { inclTaxesTpp: inclTaxesValidation }
      : { inclTaxesCustomer: inclTaxesValidation };

    return {
      newCreditNote: {
        ...creditNoteValidation,
        ...newCreditNoteDateValidation,
        ...newCreditNoteInclTaxesValidation,
      },
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
      if (this.editedCreditNote.customer) selectedCustomer = this.editedCreditNote.customer;

      if (!selectedCustomer) return [];
      return selectedCustomer.subscriptions.map(sub => ({
        label: sub.service.name,
        value: sub._id,
      }));
    },
    creditNoteEventsOptions () {
      return this.creditNoteEvents.map(cnEvent => ({
        label: `${moment(cnEvent.startDate).format('DD/MM/YYYY HH:mm')} - ${moment(cnEvent.endDate).format('HH:mm')}`,
        value: cnEvent.eventId,
      }));
    },
    thirdPartyPayerOptions () {
      let customer;
      if (this.creditNoteCreationModal) customer = this.newCreditNote.customer;
      if (this.creditNoteEditionModal) customer = this.editedCreditNote.customer;

      const selectedCustomer = this.customersOptions.find(cus => cus.value === customer);
      if (!selectedCustomer) return [];

      return selectedCustomer.thirdPartyPayers.map(tpp => ({ label: tpp.name, value: tpp._id }));
    },
    creationMinAndMaxDates () {
      return this.setMinAndMaxDates(this.newCreditNote.events);
    },
    editionMinAndMaxDates () {
      return this.setMinAndMaxDates(this.editedCreditNote.events);
    },
  },
  methods: {
    get,
    resetCustomerData () {
      this.creditNoteEvents = [];
      this.newCreditNote = {
        ...this.newCreditNote,
        thirdPartyPayer: '',
        events: [],
        subscription: null,
        startDate: '',
        endDate: '',
        exclTaxesCustomer: toString(0),
        inclTaxesCustomer: 0,
        exclTaxesTpp: toString(0),
        inclTaxesTpp: 0,
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
      };

      this.v$.newCreditNote.startDate.$reset();
      this.v$.newCreditNote.endDate.$reset();
      this.v$.newCreditNote.subscription.$reset();
      this.v$.newCreditNote.inclTaxesCustomer.$reset();
      this.v$.newCreditNote.inclTaxesTpp.$reset();
      this.v$.newCreditNote.billingItemList.$reset();
    },
    // Refresh data
    async refreshBillingItemsOptions () {
      const billingItems = Object.freeze(await BillingItems.list({ type: MANUAL }));
      this.billingItems = billingItems;
      this.billingItemsOptions = formatAndSortOptions(billingItems, 'name');
    },
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
        const canGetEvents = this.creditNoteType === EVENTS &&
          creditNote.customer &&
          creditNote.startDate &&
          creditNote.endDate;
        if (!canGetEvents || validations.startDate.$error || validations.endDate.$error) return;

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
        NotifyNegative('Impossible de récupérer les évènements facturés.');
      }
    },
    async getEditionEvents (field) {
      if (field && this.v$.editedCreditNote[field]) this.v$.editedCreditNote[field].$touch();
      else this.v$.editedCreditNote.$touch();

      await this.getEvents(this.editedCreditNote, this.v$.editedCreditNote);
    },
    async getCreationEvents (field) {
      if (this.v$.newCreditNote[field]) this.v$.newCreditNote[field].$touch();
      set(this.newCreditNote, 'events', []);

      await this.getEvents(this.newCreditNote, this.v$.newCreditNote);
    },
    setMinAndMaxDates (events) {
      if (!events || !events.length) return { maxStartDate: '', minEndDate: '' };

      const eventsWithCreditNote = this.creditNoteEvents.filter(e => events.includes(e._id));
      const endDate = new Date(get(eventsWithCreditNote[eventsWithCreditNote.length - 1], 'endDate'));
      const startDate = new Date(get(eventsWithCreditNote[0], 'startDate'));

      return {
        maxStartDate: getEndOfDay(startDate).toString(),
        minEndDate: getStartOfDay(endDate).toString(),
      };
    },
    isValidDate (date) {
      return date && date !== 'Invalid Date';
    },
    datesValidations (minAndMaxDates, creditNote) {
      return {
        startDate: {
          required: requiredIf(this.creditNoteType === EVENTS),
          maxDate: this.isValidDate(minAndMaxDates.maxStartDate) ? maxDate(minAndMaxDates.maxStartDate) : '',
        },
        endDate: {
          required: requiredIf(this.creditNoteType === EVENTS),
          minDate: creditNote.startDate
            ? minDate(this.isValidDate(minAndMaxDates.minEndDate) ? minAndMaxDates.minEndDate : creditNote.startDate)
            : '',
        },
      };
    },
    setStartDateErrorMessage (validations) {
      if (!validations.startDate.required) return REQUIRED_LABEL;

      if (!validations.startDate.maxDate) return 'Il y a des évènements dans cet intervalle.';

      return REQUIRED_LABEL;
    },
    setEndDateErrorMessage (validations, events) {
      if (!validations.endDate.required) return REQUIRED_LABEL;

      if (!validations.endDate.minDate) {
        return events.length
          ? 'Il y a des évènements dans cet intervalle.'
          : 'La date de fin ne peut être antérieure à la date de début.';
      }

      return REQUIRED_LABEL;
    },
    getSubscriptionVat (event, customer) {
      const eventSubscription = event.subscription;
      const cus = this.customersOptions.find(c => c.value === customer);
      const customerSubscription = cus.subscriptions.find(sub => sub._id === eventSubscription);

      return customerSubscription.service.vat;
    },
    // Compute
    computePrices (eventIds, customer) {
      let exclTaxesCustomer = toString(0);
      let inclTaxesCustomerString = toString(0);
      let inclTaxesCustomer = 0;
      let exclTaxesTpp = toString(0);
      let inclTaxesTppString = toString(0);
      let inclTaxesTpp = 0;
      if (this.creditNoteEvents) {
        const selectedEvents = this.creditNoteEvents.filter(ev => eventIds.includes(ev.eventId));
        for (let i = 0, l = selectedEvents.length; i < l; i++) {
          if (selectedEvents[i].bills.exclTaxesCustomer && !isEqualTo(selectedEvents[i].bills.exclTaxesCustomer, 0)) {
            inclTaxesCustomerString = add(inclTaxesCustomerString, selectedEvents[i].bills.inclTaxesCustomer);
          }
          if (selectedEvents[i].bills.exclTaxesTpp && !isEqualTo(selectedEvents[i].bills.exclTaxesTpp, 0)) {
            inclTaxesTppString = add(inclTaxesTppString, selectedEvents[i].bills.inclTaxesTpp);
          }
        }

        inclTaxesCustomer = toFixedToFloat(inclTaxesCustomerString);
        inclTaxesTpp = toFixedToFloat(inclTaxesTppString);
        if (selectedEvents.length) {
          const subscriptionVat = this.getSubscriptionVat(this.creditNoteEvents[0], customer);
          exclTaxesCustomer = this.getExclTaxes(inclTaxesCustomer, subscriptionVat);
          exclTaxesTpp = this.getExclTaxes(inclTaxesTpp, subscriptionVat);
        }
      }

      return {
        exclTaxesCustomer,
        inclTaxesCustomer,
        exclTaxesTpp,
        inclTaxesTpp,
      };
    },
    // Creation
    resetCreationCreditNoteData () {
      this.newCreditNote = {
        customer: '',
        date: '',
        events: [],
        startDate: '',
        endDate: '',
        exclTaxesCustomer: toString(0),
        inclTaxesCustomer: 0,
        exclTaxesTpp: toString(0),
        inclTaxesTpp: 0,
        subscription: '',
        thirdPartyPayer: '',
        misc: '',
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
      };
      this.creditNoteEvents = [];
      this.creditNoteType = SUBSCRIPTION;
      this.v$.newCreditNote.$reset();
    },
    formatPayloadWithSubscription (creditNote) {
      const { customer } = creditNote;
      const payload = {};
      const selectedCustomer = customer.subscriptions
        ? customer
        : this.customersOptions.find(cus => cus.value === customer);
      const subscription = selectedCustomer.subscriptions.find(sub => sub._id === creditNote.subscription);
      const { vat } = subscription.service;
      const percentVat = divide(vat, 100);

      if (creditNote.inclTaxesCustomer) {
        payload.inclTaxesCustomer = creditNote.inclTaxesCustomer;
        payload.exclTaxesCustomer = divide(creditNote.inclTaxesCustomer, add(1, percentVat));
      } else {
        payload.inclTaxesTpp = creditNote.inclTaxesTpp;
        payload.exclTaxesTpp = divide(creditNote.inclTaxesTpp, add(1, percentVat));
        payload.thirdPartyPayer = creditNote.thirdPartyPayer;
      }

      const { _id: subId, service, versions } = subscription;
      payload.subscription = {
        _id: subId,
        service: { serviceId: service._id, nature: service.nature, name: service.name },
        vat,
        unitInclTaxes: versions && versions.length > 0
          ? getLastVersion(versions, 'createdAt').unitTTCRate
          : 0,
      };

      return payload;
    },
    formatCreditNoteEvents (creditNoteEvents) {
      return creditNoteEvents.map((eventId) => {
        const cnEvent = this.creditNoteEvents.find(ev => ev.eventId === eventId);

        return {
          ...pick(cnEvent, ['eventId', 'auxiliary', 'startDate', 'endDate', 'serviceName']),
          bills: {
            ...omit(cnEvent.bills, '_id'),
            ...(cnEvent.bills.careHours && { careHours: cnEvent.bills.careHours.toString() }),
            ...(cnEvent.bills.surcharges && { surcharges: cnEvent.bills.surcharges.map(sur => omit(sur, '_id')) }),
          },
        };
      });
    },
    formatPayloadWithLinkedEvents (creditNote) {
      const payload = {
        ...pick(
          creditNote,
          [
            'startDate',
            'endDate',
            'exclTaxesCustomer',
            'inclTaxesCustomer',
            'exclTaxesTpp',
            'inclTaxesTpp',
            'thirdPartyPayer',
          ]
        ),
      };

      if (creditNote.events.length) payload.events = this.formatCreditNoteEvents(creditNote.events);

      return payload;
    },
    formatPayloadWithBillingItems (creditNote) {
      return {
        ...pick(creditNote, ['exclTaxesCustomer', 'inclTaxesCustomer']),
        billingItemList: creditNote.billingItemList.map(bi => omit(bi, 'vat')),
      };
    },
    formatPayload (creditNote) {
      let payload = pick(creditNote, ['date', 'customer', 'misc']);

      if (this.creditNoteType === SUBSCRIPTION) {
        payload = { ...payload, ...this.formatPayloadWithSubscription(creditNote) };
      } else if (this.creditNoteType === EVENTS) {
        payload = { ...payload, ...this.formatPayloadWithLinkedEvents(creditNote) };
      } else {
        payload = { ...payload, ...this.formatPayloadWithBillingItems(creditNote) };
      }

      return pickBy(payload);
    },
    hasDuplicatedBillingItems (creditNote) {
      if (this.creditNoteType !== BILLING_ITEMS) return false;
      const billingItems = creditNote.billingItemList.map(bi => bi.billingItem);

      return billingItems.length !== [...new Set(billingItems)].length;
    },
    async createNewCreditNote () {
      try {
        if (this.creditNoteType !== BILLING_ITEMS) this.newCreditNote.billingItemList = [];

        if (this.hasDuplicatedBillingItems(this.newCreditNote)) {
          return NotifyWarning('Vous ne pouvez pas ajouter plusieurs fois le même article');
        }

        this.v$.newCreditNote.$touch();
        if (this.v$.newCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

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
    addBillingItem () {
      if (this.creditNoteCreationModal) {
        this.newCreditNote.billingItemList.push({ billingItem: '', unitInclTaxes: 0, count: 1 });
      } else if (this.creditNoteEditionModal) {
        this.editedCreditNote.billingItemList.push({ billingItem: '', unitInclTaxes: 0, count: 1 });
      }
    },
    removeBillingItem (index) {
      if (this.creditNoteCreationModal) this.newCreditNote.billingItemList.splice(index, 1);
      else if (this.creditNoteEditionModal) this.editedCreditNote.billingItemList.splice(index, 1);
    },
    updateBillingItem (event, index, path) {
      const billingItemList = this.creditNoteCreationModal
        ? [...this.newCreditNote.billingItemList]
        : [...this.editedCreditNote.billingItemList];

      set(billingItemList[index], path, event);
      if (path === 'billingItem') {
        const billingItem = this.billingItems.find(bi => bi._id === event);
        set(billingItemList[index], 'vat', billingItem?.vat || 0);
        set(billingItemList[index], 'unitInclTaxes', billingItem?.defaultUnitAmount || 0);
      }

      if (this.creditNoteCreationModal) set(this.newCreditNote.billingItemList, billingItemList);
      else if (this.creditNoteEditionModal) set(this.editedCreditNote.billingItemList, billingItemList);
    },
    getExclTaxes (inclTaxes, vat) {
      const percentVat = divide(vat, 100);

      return divide(inclTaxes, add(1, percentVat));
    },
    // Edition
    async openCreditNoteEditionModal (creditNote) {
      this.editedCreditNote = { inclTaxesCustomer: 0, inclTaxesTpp: 0, ...creditNote };
      this.editedCreditNote.customer = creditNote.customer;
      if (creditNote.thirdPartyPayer) this.editedCreditNote.thirdPartyPayer = creditNote.thirdPartyPayer;

      if (get(creditNote, 'events.length')) this.creditNoteType = EVENTS;
      else if (creditNote.subscription) this.creditNoteType = SUBSCRIPTION;
      else this.creditNoteType = BILLING_ITEMS;

      if (this.creditNoteType === EVENTS) {
        await this.getEditionEvents();
        this.editedCreditNote.events = creditNote.events.map(ev => ev.eventId);
      } else if (this.creditNoteType === SUBSCRIPTION) {
        this.editedCreditNote.subscription = creditNote.subscription._id;
      }
      this.creditNoteEditionModal = true;
    },
    resetEditionCreditNoteData () {
      this.creditNoteEditionModal = false;
      this.editedCreditNote = {};
      this.creditNoteEvents = [];
      this.creditNoteType = SUBSCRIPTION;
      this.v$.editedCreditNote.$reset();
    },
    formatEditionPayload () {
      if (this.creditNoteType === BILLING_ITEMS) {
        this.editedCreditNote.billingItemList = this.editedCreditNote.billingItemList
          .map(bi => pick(bi, ['billingItem', 'unitInclTaxes', 'count', 'vat']));
      }

      return { ...omit(this.formatPayload(this.editedCreditNote), ['customer', 'thirdPartyPayer']) };
    },
    async updateCreditNote () {
      try {
        if (this.hasDuplicatedBillingItems(this.editedCreditNote)) {
          return NotifyWarning('Vous ne pouvez pas ajouter plusieurs fois le même article');
        }

        this.v$.editedCreditNote.$touch();
        if (this.v$.editedCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;

        await CreditNotes.updateById(this.editedCreditNote._id, this.formatEditionPayload());

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
        message: 'Êtes-vous sûr(e) de vouloir supprimer cet avoir '
          + `${deletedCreditNote.linkedCreditNote ? 'et l\'avoir relié aux mêmes évènements' : ''} ?`,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteCreditNote(id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>
