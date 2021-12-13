<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures manuelles" padding />
    <ni-simple-table :columns="columns" :pagination.sync="pagination" :data="manualBills"
      :loading="tableLoading" :rows-per-page="rowsPerPage" separator="none">
      <template #body="{ props }">
        <template v-for="(billingItem, index) of props.row.billingItemList">
          <q-tr :props="props" :key="`${props.row._id}-${index}`" :class="{ 'border-top': index === 0 }">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'billingItem'">{{ billingItem.name }}</template>
              <template v-if="col.name === 'unitInclTaxes'">{{ formatPrice(billingItem.unitInclTaxes) }}</template>
              <template v-if="col.name === 'count'">{{ billingItem.count }}</template>
              <template v-if="col.name === 'exclTaxes'">{{ formatPrice(billingItem.exclTaxes) }}</template>
              <template v-if="col.name === 'inclTaxes'">{{ formatPrice(billingItem.inclTaxes) }}</template>
              <template v-else-if="index === 0">{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
        <q-tr v-if="props.row.billingItemList.length > 1" :props="props">
          <q-td colspan="7"><div class="text-right">Total :</div></q-td>
          <q-td colspan="1" align="center">{{ formatPrice(props.row.netInclTaxes) }}</q-td>
        </q-tr>
      </template>
    </ni-simple-table>

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
import { formatAndSortIdentityOptions, formatAndSortOptions, formatIdentity, formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { strictPositiveNumber, positiveNumber } from '@helpers/vuelidateCustomVal';
import ManualBillCreationModal from 'src/modules/client/components/customers/billing/ManualBillCreationModal';
import SimpleTable from '@components/table/SimpleTable';

export default {
  name: 'ManualBills',
  metaInfo: { title: 'Factures manuelles' },
  components: {
    'ni-title-header': TitleHeader,
    'ni-manual-bill-creation-modal': ManualBillCreationModal,
    'ni-simple-table': SimpleTable,
  },
  data () {
    return {
      rowsPerPage: [1, 5, 15, 50, 100, 200, 300],
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
      manualBills: [],
      pagination: { rowsPerPage: 0, sortBy: 'date', descending: true },
      tableLoading: false,
      columns: [
        { name: 'number', label: '#', align: 'left', field: 'number' },
        { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => formatIdentity(row.customer.identity, 'Lf'),
        },
        { name: 'billingItem', label: 'Article', align: 'center' },
        { name: 'unitInclTaxes', label: 'PU TTC', align: 'center' },
        { name: 'count', label: 'Quantité', align: 'center' },
        { name: 'exclTaxes', label: 'HT', align: 'center' },
        { name: 'inclTaxes', label: 'TTC', align: 'center' },
      ],
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
    await Promise.all([this.getManualBills(), this.refresh()]);
  },
  methods: {
    formatPrice,
    async getManualBills () {
      try {
        this.tableLoading = true;

        this.manualBills = Object.freeze(await Bills.list({ type: MANUAL }));
      } catch (e) {
        this.manualBills = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des factures manuelles');
      } finally {
        this.tableLoading = false;
      }
    },
    async refresh () {
      try {
        this.modalLoading = true;
        this.customers = Object.freeze(await Customers.list({ archived: false }));
        this.billingItems = Object.freeze(await BillingItems.list({ type: MANUAL }));
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
        ...pick(this.newManualBill, ['customer', 'date']),
        billingItemList: this.newManualBill.billingItemList.map(bi => omit(bi, 'vat')),
      };
    },
    async createManualBill () {
      try {
        this.$v.newManualBill.$touch();
        if (this.$v.newManualBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;

        await Bills.create(this.formatCreationPayload());

        await this.getManualBills();
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

<style lang="sass" scoped>
.border-top td
  border-width: 1px 0 0 0
</style>
