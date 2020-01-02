<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="Suivi des plans d'aide">
      <template slot="content">
        <div class=" col-xs-12 row items-baseline justify-end fill-width">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <ni-select-sector class="q-pl-sm" v-model="selectedSector" allow-null-option />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-4">
            <ni-select class="q-pl-sm" :options="thirdPartyPayerOptions" v-model="selectedThirdPartyPayer" allow-null-option />
          </div>
        </div>
      </template>
    </ni-title-header>
    <ni-large-table :data="displayedCustomersFundingsMonitoring" :columns="columns" :loading="tableLoading" row-key="_id"
      :pagination.sync="pagination">
      <template v-slot:body="{ props }" >
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template> {{ col.value }} </template>
          </q-td>
        </q-tr>
      </template>
    </ni-large-table>
  </q-page>
</template>

<script>
import LargeTable from '../../../components/table/LargeTable';
import TitleHeader from '../../../components/TitleHeader';
import Select from '../../../components/form/Select';
import SelectSector from '../../../components/form/SelectSector';
import { formatIdentity, formatHours, formatPrice } from '../../../helpers/utils';
import { NotifyNegative } from '../../../components/popup/notify';

export default {
  name: 'CustomersFundingsMonitoring',
  metaInfo: {
    title: 'Suivi des plans d\'aide',
  },
  components: {
    'ni-large-table': LargeTable,
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
      thirdPartyPayerOptions: [],
      allCustomersFundingsMonitoring: [],
      columns: [
        {
          name: 'tpp',
          label: 'Financeur',
          field: row => this.$_.get(row, 'tpp.name', ''),
          align: 'left',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          field: 'customer',
          format: value => formatIdentity(value, 'fL'),
          align: 'left',
        },
        {
          name: 'referent',
          label: 'Référent',
          field: 'referent',
          format: value => formatIdentity(value, 'FL'),
          align: 'left',
        },
        {
          name: 'sector',
          label: 'Equipe',
          field: row => this.$_.get(row, 'sector.name', ''),
          align: 'left',
        },
        {
          name: 'customerParticipationRate',
          label: 'Taux participation bénéficiaire',
          field: 'customerParticipationRate',
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
          name: 'plannedCareHours',
          label: 'Nb d\'heures',
          field: 'plannedCareHours',
          format: value => formatHours(value),
          align: 'center',
        },
        {
          name: 'prevMonthCareHours',
          label: 'Mois précédent',
          field: 'prevMonthCareHours',
          format: value => value === -1 ? 'N/A' : formatHours(value, 1),
          align: 'center',
        },
        {
          name: 'currentMonthCareHours',
          label: 'Mois en cours',
          field: 'currentMonthCareHours',
          format: value => formatHours(value, 1),
          align: 'center',
        },
        {
          name: 'nextMonthCareHours',
          label: 'Mois prochain',
          field: 'nextMonthCareHours',
          format: value => value === -1 ? 'N/A' : formatHours(value, 1),
          align: 'center',
        },
      ],
    };
  },
  computed: {
    displayedCustomersFundingsMonitoring () {
      let allCustomersFundingsMonitoring = this.allCustomersFundingsMonitoring;
      if (this.selectedSector !== '') {
        allCustomersFundingsMonitoring = allCustomersFundingsMonitoring.filter(elem =>
          this.$_.get(elem, 'sector._id', null) === this.selectedSector);
      }
      if (this.selectedThirdPartyPayer !== '') {
        allCustomersFundingsMonitoring = allCustomersFundingsMonitoring.filter(elem => {
          return elem.tpp._id === this.selectedThirdPartyPayer
        });
      }
      return allCustomersFundingsMonitoring;
    },
  },
  async mounted () {
    try {
      this.tableLoading = true;
      this.thirdPartyPayerOptions = (await this.$thirdPartyPayers.list()).map(elem => { return { value: elem._id, label: elem.name } });
      this.thirdPartyPayerOptions.push({ value: '', label: 'Tous les financeurs' });
      this.allCustomersFundingsMonitoring = await this.$stats.getAllCustomersFundingsMonitoring();
    } catch (e) {
      this.allCustomersFundingsMonitoring = [];
      this.tableLoading = true;
      NotifyNegative('Erreur lors de la récupération des plans d\'aide');
    } finally {
      this.tableLoading = false;
    }
  },
}
</script>
