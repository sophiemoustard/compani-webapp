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
            <q-checkbox class="q-mr-md" @update:model-value="selectRows" :model-value="!!selected.length" dense
              :disable="balancesOption === 2" indeterminate-value="some" />
          </q-th>
        </q-tr>
      </template>
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div />
            </template>
            <template v-else-if="col.name === 'balance'">
              <ni-prefixed-cell-content :cell-value="col.value" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
          <q-td v-if="props.row.toPay > 0" align="right" auto-width>
            <q-checkbox class="q-mr-md" v-model="props.selected" dense />
          </q-td>
          <q-td v-else />
        </q-tr>
      </template>
    </ni-simple-table>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { onMounted, ref, computed } from 'vue';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import Balances from '@api/Balances';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import PrefixedCellContent from '@components/table/PrefixedCellContent';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import {
  formatPrice,
  formatIdentity,
  truncate,
  roundFrenchPercentage,
  formatNumberForCSV,
} from '@helpers/utils';
import { formatDate } from '@helpers/date';
import moment from '@helpers/moment';
import { downloadCsv } from '@helpers/file';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
  },
  setup () {
    const metaInfo = { title: 'Balances clients' };
    useMeta(metaInfo);

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

    return {
      // Data
      tableLoading,
      selected,
      balancesOption,
      // Computed
      filteredBalances,
      // Methods
      exportToCSV,
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
};
</script>
