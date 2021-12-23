<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Suivi des plans d'aide" padding>
      <template #title>
        <ni-button icon="save_alt" @click="exportToCSV" class="q-ml-sm" :disable="!allCustomersFundings.length" />
      </template>
      <template slot="content">
        <div class="col-xs-12 header-selects">
          <div class="row header-selects-container">
            <div class="col-xs-12 col-sm-6">
              <ni-select-sector class="q-pl-sm" v-model="selectedSector" @input="onInputSector" allow-null-option />
            </div>
            <div class="col-xs-12 col-sm-6">
              <ni-select class="q-pl-sm" :options="thirdPartyPayerOptions" v-model="selectedThirdPartyPayer"
                @input="onInputThirdPartyPayer" allow-null-option caption="Financeur" />
            </div>
          </div>
        </div>
      </template>
    </ni-title-header>
    <ni-simple-table :data="displayedCustomersFundingsMonitoring" :columns="columns" :loading="tableLoading"
      row-key="_id" :pagination.sync="pagination">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template> {{ col.value }} </template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import moment from '@helpers/moment';
import { downloadCsv } from '@helpers/file';
import Stats from '@api/Stats';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import Button from '@components/Button';
import SimpleTable from '@components/table/SimpleTable';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import SelectSector from '@components/form/SelectSector';
import { NotifyNegative } from '@components/popup/notify';
import {
  formatIdentity,
  formatHours,
  formatPrice,
  roundFrenchPercentage,
  truncate,
  formatNumberForCSV,
} from '@helpers/utils';

export default {
  name: 'CustomersFundingsMonitoring',
  metaInfo: { title: 'Suivi des plans d\'aide' },
  components: {
    'ni-button': Button,
    'ni-simple-table': SimpleTable,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-select-sector': SelectSector,
  },
  data () {
    return {
      tableLoading: false,
      pagination: {
        sortBy: 'customer',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      selectedSector: '',
      selectedThirdPartyPayer: '',
      thirdPartyPayerOptions: [{ value: '', label: 'Tous les financeurs' }],
      allCustomersFundings: [],
      columns: [
        {
          name: 'tpp',
          label: 'Financeur',
          field: row => this.getTppName(row),
          format: value => truncate(value),
          align: 'left',
          classes: 'text-weight-bold',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          field: 'customer',
          format: value => this.formatCustomerName(value),
          align: 'left',
          classes: 'text-weight-bold',
          sort: (a, b) => b.lastname.localeCompare(a.lastname),
        },
        {
          name: 'referent',
          label: 'Référent',
          field: 'referent',
          format: value => this.formatReferentName(value),
          align: 'left',
        },
        {
          name: 'sector',
          label: 'Equipe',
          field: row => this.getSectorName(row),
          align: 'left',
        },
        {
          name: 'customerParticipationRate',
          label: 'Taux participation bénéficiaire',
          field: 'customerParticipationRate',
          format: value => roundFrenchPercentage(value),
          align: 'center',
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire',
          field: 'unitTTCRate',
          format: value => formatPrice(value),
          align: 'center',
        },
        {
          name: 'careHours',
          label: 'Nb d\'heures',
          field: 'careHours',
          format: value => formatHours(value),
          align: 'center',
          classes: 'text-weight-bold',
        },
        {
          name: 'prevMonthCareHours',
          label: 'Mois précédent',
          field: 'prevMonthCareHours',
          format: value => (value === -1 ? 'N/A' : formatHours(value, 1)),
          align: 'center',
        },
        {
          name: 'currentMonthCareHours',
          label: 'Mois en cours',
          field: 'currentMonthCareHours',
          format: value => formatHours(value, 1),
          align: 'center',
          classes: 'text-weight-bold',
        },
        {
          name: 'nextMonthCareHours',
          label: 'Mois prochain',
          field: 'nextMonthCareHours',
          format: value => (value === -1 ? 'N/A' : formatHours(value, 1)),
          align: 'center',
        },
      ],
    };
  },
  computed: {
    displayedCustomersFundingsMonitoring () {
      let monitoring = this.allCustomersFundings;
      if (this.selectedSector !== '') {
        monitoring = monitoring.filter(elem => get(elem, 'sector._id', null) === this.selectedSector);
      }
      if (this.selectedThirdPartyPayer !== '') {
        monitoring = monitoring.filter(elem => elem.tpp._id === this.selectedThirdPartyPayer);
      }
      return monitoring;
    },
  },
  methods: {
    async getThirdPartyPayerOptions () {
      try {
        this.thirdPartyPayerOptions = (await ThirdPartyPayers.list())
          .map(elem => ({ value: elem._id, label: elem.name }));
        this.thirdPartyPayerOptions.push({ value: '', label: 'Tous les financeurs' });
      } catch (e) {
        this.thirdPartyPayerOptions = [{ value: '', label: 'Tous les financeurs' }];
      }
    },
    onInputThirdPartyPayer () {
      if (this.selectedThirdPartyPayer !== '') this.selectedSector = '';
    },
    onInputSector () {
      if (this.selectedSector !== '') this.selectedThirdPartyPayer = '';
    },
    getTppName (cusData) {
      return get(cusData, 'tpp.name') || '';
    },
    formatCustomerName (customer) {
      return formatIdentity(customer, 'Lf');
    },
    formatReferentName (referent) {
      return formatIdentity(referent, 'Lf');
    },
    getSectorName (cusData) {
      return get(cusData, 'sector.name') || '';
    },
    async exportToCSV () {
      const csvData = [[
        'Financeur',
        'Bénéficiaire',
        'Référent(e)',
        'Equipe',
        'Taux participation du/de la bénéficiaire',
        'Prix unitaire',
        'Nb d\'heures',
        'Mois précédent',
        'Mois en cours',
        'Mois suivant',
      ]];

      for (const cusData of this.allCustomersFundings) {
        csvData.push([
          this.getTppName(cusData),
          this.formatCustomerName(cusData.customer),
          this.formatReferentName(cusData.referent),
          this.getSectorName(cusData),
          formatNumberForCSV(cusData.customerParticipationRate),
          formatNumberForCSV(cusData.unitTTCRate),
          formatNumberForCSV(cusData.careHours),
          formatNumberForCSV(cusData.prevMonthCareHours),
          formatNumberForCSV(cusData.currentMonthCareHours),
          formatNumberForCSV(cusData.nextMonthCareHours),
        ]);
      }

      return downloadCsv(csvData, `customers_fundings_${moment().format('MM_YYYY')}.csv`);
    },
  },
  async created () {
    try {
      this.tableLoading = true;
      await this.getThirdPartyPayerOptions();
      this.allCustomersFundings = Object.freeze(await Stats.getAllCustomersFundingsMonitoring());
    } catch (e) {
      this.allCustomersFundings = [];
      this.tableLoading = true;
      NotifyNegative('Erreur lors de la récupération des plans d\'aide.');
    } finally {
      this.tableLoading = false;
    }
  },
};
</script>
