<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures manuelles" padding />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer une facture"
      @click="manualBillCreationModal = true" />

    <ni-manual-bill-creation-modal v-model="manualBillCreationModal" :validations="$v.newManualBill"
      :loading="modalLoading" :new-manual-bill.sync="newManualBill" :customers-options="customersOptions"
      :billing-items-options="billingItemsOptions" @hide="resetManualBillCreationModal" @submit="createManualBill"
      :billing-items="billingItems" @add-billing-item="addBillingItem" @update-billing-item="updateBillingItem"
      @remove-billing-item="removeBillingItem" />
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Customers from '@api/Customers';
import BillingItems from '@api/BillingItems';
import Bills from '@api/Bills';
import TitleHeader from '@components/TitleHeader';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { MANUAL } from '@data/constants';
import { formatAndSortIdentityOptions, formatAndSortOptions } from '@helpers/utils';
import { strictPositiveNumber, positiveNumber } from '@helpers/vuelidateCustomVal';
import ManualBillCreationModal from 'src/modules/client/components/customers/billing/ManualBillCreationModal';

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
      modalLoading: false,
      newManualBill: {
        date: '',
        customer: '',
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
        netInclTaxes: 0,
      },
      customers: [],
      billingItems: [],
    };
  },
  validations: {
    newManualBill: {
      date: { required },
      customer: { required },
      billingItemList: {
        $each: {
          billingItem: { required },
          unitInclTaxes: { positiveNumber, required },
          count: { strictPositiveNumber, required },
        },
      },
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
  watch: {
    'newManualBill.billingItemList': {
      deep: true,
      handler () {
        this.newManualBill.netInclTaxes = this.newManualBill.billingItemList
          .reduce((acc, bi) => acc + bi.unitInclTaxes * bi.count, 0);
      },
    },
  },
  async created () {
    await this.refresh();
  },
  methods: {
    async refresh () {
      try {
        this.modalLoading = true;
        this.customers = await Customers.list();
        this.billingItems = await BillingItems.list({ type: MANUAL });
      } catch (e) {
        console.error(e);
      } finally {
        this.modalLoading = false;
      }
    },
    addBillingItem () {
      this.newManualBill.billingItemList.push({ billingItem: '', unitInclTaxes: 0, count: 1 });
    },
    removeBillingItem (index) {
      this.newManualBill.billingItemList.splice(index, 1);
    },
    updateBillingItem (event, index, path) {
      this.$set(this.newManualBill.billingItemList[index], path, event);
      if (path === 'billingItem') {
        const billingItem = this.billingItems.find(bi => bi._id === event);
        this.$set(this.newManualBill.billingItemList[index], 'vat', billingItem?.vat || 0);
        this.$set(this.newManualBill.billingItemList[index], 'unitInclTaxes', billingItem?.defaultUnitAmount || 0);
      }
    },
    resetManualBillCreationModal () {
      this.newManualBill = {
        date: '',
        customer: '',
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
      };
      this.$v.newManualBill.$reset();
    },
    formatCreationPayload () {
      return {
        ...pick(this.newManualBill, ['customer', 'date', 'netInclTaxes']),
        billingItemList: this.newManualBill.billingItemList.map(bi => omit(bi, 'vat')),
      };
    },
    async createManualBill () {
      try {
        this.$v.newManualBill.$touch();
        if (this.$v.newManualBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;

        await Bills.create(this.formatCreationPayload());

        this.manualBillCreationModal = false;
        NotifyPositive('Facture créée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la facture.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
