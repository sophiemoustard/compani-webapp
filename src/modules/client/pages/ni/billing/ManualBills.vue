<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures manuelles" padding />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer une facture"
      @click="manualBillCreationModal = true" />

    <ni-manual-bill-creation-modal v-model="manualBillCreationModal" :validations="$v.newManualBill"
      :loading="manualBillCreationLoading" :new-manual-bill.sync="newManualBill" :customers-options="customersOptions"
      :billing-items-options="billingItemsOptions" @hide="resetManualBillCreationModal" @submit="createManualBill"
      :billing-items="billingItems" />
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Customers from '@api/Customers';
import BillingItems from '@api/BillingItems';
import Bills from '@api/Bills';
import TitleHeader from '@components/TitleHeader';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import ManualBillCreationModal from 'src/modules/client/components/customers/billing/ManualBillCreationModal';
import { formatAndSortIdentityOptions, formatAndSortOptions } from '@helpers/utils';
import { strictPositiveNumber, positiveNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'ManualBills',
  metaInfo: { title: 'Factures manuelles' },
  components: {
    'ni-title-header': TitleHeader,
    'ni-manual-bill-creation-modal': ManualBillCreationModal,
  },
  data () {
    return {
      manualBillCreationModal: false,
      manualBillCreationLoading: false,
      newManualBill: { date: '', customer: {}, billingItem: {}, unitInclTaxes: 0, count: 1 },
      customers: [],
      billingItems: [],

    };
  },
  validations: {
    newManualBill: {
      date: { required },
      customer: { required },
      billingItem: { required },
      unitInclTaxes: { positiveNumber, required },
      count: { strictPositiveNumber, required },
    },
  },
  computed: {
    customersOptions () {
      return formatAndSortIdentityOptions(this.customers);
    },
    billingItemsOptions () {
      return formatAndSortOptions(this.billingItems, 'name');
    },
  },
  async created () {
    this.customers = await Customers.list();
    this.billingItems = await BillingItems.list();
  },
  methods: {
    resetManualBillCreationModal () {
      this.newManualBill = { date: '', customer: {}, billingItem: {}, unitInclTaxes: 0, count: 1 };
      this.$v.newManualBill.$reset();
    },
    formatCreationPayload () {
      const netInclTaxes = this.newManualBill.unitInclTaxes * this.newManualBill.count;
      return {
        customer: this.newManualBill.customer,
        date: this.newManualBill.date,
        billingItemList: [{
          billingItem: this.newManualBill.billingItem,
          unitInclTaxes: this.newManualBill.unitInclTaxes,
          count: this.newManualBill.count,
        }],
        netInclTaxes,
      };
    },
    async createManualBill () {
      try {
        this.$v.newManualBill.$touch();
        if (this.$v.newManualBill.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.manualBillCreationLoading = true;

        await Bills.create(this.formatCreationPayload());

        this.manualBillCreationModal = false;
        NotifyPositive('Facture créée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la facture.');
      } finally {
        this.manualBillCreationLoading = false;
      }
    },
  },
};
</script>
