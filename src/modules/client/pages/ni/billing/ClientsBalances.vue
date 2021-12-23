<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Balances Clients" padding>
      <template #title>
        <ni-button icon="save_alt" @click="exportToCSV" :disable="!filteredBalances.length" class="q-ml-sm" />
      </template>
      <template slot="content">
        <div class="col-xs-12 col-md-6 on-left">
          <ni-select :options="balancesOptions" v-model="balancesOption" @input="resetSelected" />
        </div>
      </template>
    </ni-title-header>
    <ni-simple-table :data="filteredBalances" :columns="columns" row-key="rowId" :loading="tableLoading"
      selection="multiple" :pagination.sync="pagination" :selected.sync="selected">
      <template #header="{ props }">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
          <q-th auto-width>
            <q-checkbox @input="selectRows(props.selected)" v-model="props.selected" indeterminate-value="some" dense
              :disable="balancesOption === 2" />
          </q-th>
        </q-tr>
      </template>
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions">
                <ni-button icon="remove_red_eye" @click="goToCustomerBillingPage(col.value)" />
                <ni-button icon="add"
                  @click="openPaymentCreationModal(props.row.customer, props.row.thirdPartyPayer)" />
              </div>
            </template>
            <template v-else-if="col.name === 'balance'">
              <ni-prefixed-cell-content :cell-value="col.value" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
          <q-td v-if="props.row.toPay > 0" align="right" auto-width>
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td v-else />
        </q-tr>
      </template>
    </ni-simple-table>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal v-model="paymentCreationModal" :new-payment.sync="newPayment"
      :selected-tpp="selectedTpp" :loading="paymentCreationLoading" @hide="resetPaymentCreationModal"
      @submit="submitPaymentCreation" :selected-customer="selectedCustomer" :validations="$v.newPayment" />

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer les prélèvements"
      :disable="selected.length === 0" @click="validatePaymentListCreation" />
  </q-page>
</template>

<script>
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import Payments from '@api/Payments';
import Balances from '@api/Balances';
import TaxCertificates from '@api/TaxCertificates';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import PrefixedCellContent from '@components/table/PrefixedCellContent';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import {
  formatPrice,
  getLastVersion,
  formatIdentity,
  truncate,
  roundFrenchPercentage,
  formatNumberForCSV,
} from '@helpers/utils';
import { formatDate } from '@helpers/date';
import moment from '@helpers/moment';
import { downloadCsv } from '@helpers/file';
import PaymentCreationModal from 'src/modules/client/components/customers/billing/PaymentCreationModal';
import { paymentMixin } from 'src/modules/client/mixins/paymentMixin';

export default {
  name: 'ClientsBalances',
  metaInfo: { title: 'Balances clients' },
  components: {
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-payment-creation-modal': PaymentCreationModal,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
  },
  mixins: [paymentMixin],
  data () {
    return {
      tableLoading: false,
      selected: [],
      balances: [],
      columns: [
        {
          name: 'client',
          label: 'Client',
          align: 'left',
          field: row => this.formatClient(row),
          format: val => truncate(val),
          classes: 'uppercase text-weight-bold',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => this.formatCustomer(row),
          format: val => truncate(val),
          classes: 'uppercase text-weight-bold',
        },
        {
          name: 'participationRate',
          label: 'Taux de participation',
          align: 'center',
          field: row => (row.thirdPartyPayer ? '' : row.participationRate),
          format: (value, row) => (row.thirdPartyPayer ? '' : roundFrenchPercentage(value)),
          sortable: true,
        },
        { name: 'billed', label: 'Facturé TTC', align: 'center', field: 'billed', format: val => formatPrice(val) },
        { name: 'paid', label: 'Payé TTC', align: 'center', field: 'paid', format: val => formatPrice(val) },
        { name: 'balance', label: 'Solde', align: 'center', field: row => row.balance, sortable: true },
        { name: 'lastCesuDate', label: 'Dernier CESU', field: 'lastCesuDate', align: 'center', format: formatDate },
        { name: 'toPay', label: 'A Prélever', align: 'center', field: 'toPay', format: formatPrice, sortable: true },
        { name: 'actions', label: '', align: 'left', field: row => row.customer._id },
      ],
      pagination: { rowsPerPage: 0 },
      balancesOptions: [
        { label: 'Tous', value: 0 },
        { label: 'Bénéficiaires', value: 1 },
        { label: 'Tiers payeurs', value: 2 },
      ],
      balancesOption: 0,
    };
  },
  computed: {
    filteredBalances () {
      const orderedByCustomerBalances = orderBy(
        this.balances,
        row => get(row, 'customer.identity.lastname', '').toLowerCase(),
        ['asc']
      );
      if (this.balancesOption === 1) return orderedByCustomerBalances.filter(balance => !balance.thirdPartyPayer);
      if (this.balancesOption === 2) {
        return orderBy(
          orderedByCustomerBalances.filter(balance => balance.thirdPartyPayer),
          row => get(row, 'thirdPartyPayer.name', '').toLowerCase(),
          ['asc']
        );
      }
      return orderedByCustomerBalances;
    },
  },
  async mounted () {
    await this.refresh();
  },
  methods: {
    resetSelected () {
      this.selected = [];
    },
    goToCustomerBillingPage (customerId) {
      this.$router.push({ name: 'ni customers info', params: { customerId, defaultTab: 'billing' } });
    },
    selectRows (oldValue) {
      if (oldValue) this.selected = [];
      else this.selected = this.balances.filter(bl => bl.toPay > 0);
    },
    // Refresh
    async refresh () {
      try {
        this.tableLoading = true;
        this.balances = await Balances.list();
        this.balances = this.balances.map(balance => ({ ...balance, rowId: uniqueId() }));
      } catch (e) {
        this.balances = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    async createPaymentList () {
      try {
        const payload = this.selected.map(row => ({
          nature: this.PAYMENT,
          customer: row._id.customer,
          customerInfo: row.customer,
          netInclTaxes: row.toPay,
          type: this.PAYMENT_OPTIONS[0].value,
          date: new Date(),
          rum: getLastVersion(row.customer.payment.mandates, 'createdAt').rum,
        }));

        await Payments.createList(payload);
        NotifyPositive('Règlement(s) créé(s)');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du(des) règlement(s).');
      } finally {
        this.selected = [];
      }
    },
    validatePaymentListCreation () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous ?',
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(this.createPaymentList)
        .onCancel(() => NotifyPositive('Création des règlements annulée'));
    },
    formatClient (data) {
      return data.thirdPartyPayer ? data.thirdPartyPayer.name : formatIdentity(data.customer.identity, 'Lf');
    },
    formatCustomer (data) {
      return formatIdentity(data.customer.identity, 'Lf');
    },
    async exportToCSV () {
      const csvData = [[
        'Client',
        'Bénéficiaire',
        'Taux de participation',
        'Facturé TTC',
        'Payé TTC',
        'Solde',
        'A prélever',
      ]];

      for (const clientData of this.filteredBalances) {
        csvData.push([
          this.formatClient(clientData),
          this.formatCustomer(clientData),
          clientData.thirdPartyPayer ? '' : formatNumberForCSV(clientData.participationRate),
          formatNumberForCSV(clientData.billed),
          formatNumberForCSV(clientData.paid),
          formatNumberForCSV(clientData.balance),
          formatNumberForCSV(clientData.toPay),
        ]);
      }

      return downloadCsv(csvData, `clients_balances_${moment().format('DD_MM_YYYY')}.csv`);
    },
    async submitPaymentCreation () {
      const taxCertificates = await TaxCertificates.list({ customer: this.newPayment.customer });
      return this.validatePaymentCreation(taxCertificates);
    },
  },
};
</script>
