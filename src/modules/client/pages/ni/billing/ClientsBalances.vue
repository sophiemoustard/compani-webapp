<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Balances Clients" padding>
      <template #title>
        <ni-button icon="save_alt" @click="exportToCSV" :disable="!filteredBalances.length" class="q-ml-sm" />
      </template>
      <template #content>
        <div class="col-xs-12 col-md-6 on-left">
          <ni-select :options="balancesOptions" v-model="balancesOption" @update:model-value="resetSelected" />
        </div>
      </template>
    </ni-title-header>
    <ni-simple-table :data="filteredBalances" :columns="columns" row-key="rowId" :loading="tableLoading"
      selection="multiple" v-model:pagination="pagination" v-model:selected="selected">
      <template #header="{ props }">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
          <q-th auto-width>
            <div class="q-mr-md">
              <q-checkbox @update:model-value="selectRows" :model-value="!!selected.length" dense
                :disable="balancesOption === 2" indeterminate-value="some" />
            </div>
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
            <div class="q-mr-md">
              <q-checkbox v-model="props.selected" dense />
            </div>
          </q-td>
          <q-td v-else />
        </q-tr>
      </template>
    </ni-simple-table>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal v-model="paymentCreationModal" v-model:new-payment="newPayment"
      :selected-tpp="selectedTpp" :loading="paymentCreationLoading" @hide="resetPaymentCreationModal"
      @submit="submitPaymentCreation" :selected-customer="selectedCustomer" :validations="v$.newPayment" />

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer les prélèvements"
      :disable="selected.length === 0" @click="validatePaymentListCreation" />
  </q-page>
</template>

<script>
import { useMeta, useQuasar } from 'quasar';
import { onMounted, ref, computed } from 'vue';
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
import { PAYMENT, PAYMENT_OPTIONS } from '@data/constants';
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
import { usePayments } from 'src/modules/client/composables/payments';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-payment-creation-modal': PaymentCreationModal,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
  },
  setup () {
    const metaInfo = { title: 'Balances clients' };
    useMeta(metaInfo);

    const $q = useQuasar();

    const tableLoading = ref(false);
    const selected = ref([]);
    const balances = ref([]);
    const balancesOption = ref(0);

    const filteredBalances = computed(() => {
      const orderedByCustomerBalances = orderBy(
        balances.value,
        row => get(row, 'customer.identity.lastname', '').toLowerCase(),
        ['asc']
      );
      if (balancesOption.value === 1) return orderedByCustomerBalances.filter(balance => !balance.thirdPartyPayer);
      if (balancesOption.value === 2) {
        return orderBy(
          orderedByCustomerBalances.filter(balance => balance.thirdPartyPayer),
          row => get(row, 'thirdPartyPayer.name', '').toLowerCase(),
          ['asc']
        );
      }
      return orderedByCustomerBalances;
    });

    onMounted(async () => { await refresh(); });

    const refresh = async () => {
      try {
        tableLoading.value = true;
        balances.value = await Balances.list();
        balances.value = balances.value.map(balance => ({ ...balance, rowId: uniqueId() }));
      } catch (e) {
        balances.value = [];
        console.error(e);
      } finally {
        tableLoading.value = false;
      }
    };

    const resetSelected = () => { selected.value = []; };

    const selectRows = () => {
      if (selected.value.length) selected.value = [];
      else selected.value = balances.value.filter(bl => bl.toPay > 0);
    };

    const createPaymentList = async () => {
      try {
        const payload = selected.value.map(row => ({
          nature: PAYMENT,
          customer: row._id.customer,
          customerInfo: row.customer,
          netInclTaxes: row.toPay,
          type: PAYMENT_OPTIONS[0].value,
          date: new Date(),
          rum: getLastVersion(row.customer.payment.mandates, 'createdAt').rum,
        }));

        await Payments.createList(payload);
        NotifyPositive('Règlement(s) créé(s)');
        await refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du(des) règlement(s).');
      } finally {
        selected.value = [];
      }
    };

    const validatePaymentListCreation = () => {
      $q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous&nbsp;?',
        html: true,
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(createPaymentList)
        .onCancel(() => NotifyPositive('Création des règlements annulée'));
    };

    const formatClient = data => (data.thirdPartyPayer
      ? data.thirdPartyPayer.name
      : formatIdentity(data.customer.identity, 'Lf'));

    const formatCustomer = data => formatIdentity(data.customer.identity, 'Lf');

    const exportToCSV = async () => {
      const csvData = [[
        'Client',
        'Bénéficiaire',
        'Taux de participation du bénéficiaire',
        'Facturé TTC',
        'Payé TTC',
        'Solde',
        'A prélever',
      ]];

      for (const clientData of filteredBalances.value) {
        csvData.push([
          formatClient(clientData),
          formatCustomer(clientData),
          clientData.thirdPartyPayer ? '' : formatNumberForCSV(clientData.participationRate),
          formatNumberForCSV(clientData.billed),
          formatNumberForCSV(clientData.paid),
          formatNumberForCSV(clientData.balance),
          formatNumberForCSV(clientData.toPay),
        ]);
      }

      return downloadCsv(csvData, `clients_balances_${moment().format('DD_MM_YYYY')}.csv`);
    };

    const {
      paymentCreationLoading,
      paymentCreationModal,
      selectedCustomer,
      selectedTpp,
      newPayment,
      v$,
      openPaymentCreationModal,
      resetPaymentCreationModal,
      validatePaymentCreation,
    } = usePayments(refresh);

    const submitPaymentCreation = async () => {
      const taxCertificates = await TaxCertificates.list({ customer: newPayment.value.customer });
      return validatePaymentCreation(taxCertificates);
    };

    return {
      // Data
      tableLoading,
      selected,
      balancesOption,
      paymentCreationLoading,
      paymentCreationModal,
      selectedCustomer,
      selectedTpp,
      newPayment,
      // Computed
      filteredBalances,
      // Valdiations
      v$,
      // Methods
      openPaymentCreationModal,
      resetPaymentCreationModal,
      validatePaymentListCreation,
      exportToCSV,
      submitPaymentCreation,
      resetSelected,
      selectRows,
      formatClient,
      formatCustomer,
    };
  },
  data () {
    return {
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
          label: 'Taux de participation du bénéficiaire',
          align: 'center',
          field: row => (row.thirdPartyPayer ? '' : row.participationRate),
          format: (value, row) => (row.thirdPartyPayer ? '' : roundFrenchPercentage(value)),
          sortable: true,
          style: 'width: 15%',
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
    };
  },
  methods: {
    goToCustomerBillingPage (customerId) {
      this.$router.push({ name: 'ni customers info', params: { customerId, defaultTab: 'billing' } });
    },
  },
};
</script>
