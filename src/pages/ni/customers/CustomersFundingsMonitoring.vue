`<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Suivi des plans d'aide</h4>
    </div>
    <ni-large-table :data="allCustomersFundingsMonitoring" :columns="columns" :loading="tableLoading" row-key="_id"
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
import { formatIdentity } from '../../../helpers/utils';
import { NotifyNegative } from '../../../components/popup/notify';

export default {
  name: 'CustomersFundingsMonitoring',
  metaInfo: {
    title: 'Suivi des plans d\'aide',
  },
  components: {
    'ni-large-table': LargeTable,
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
      allCustomersFundingsMonitoring: [],
      columns: [
        {
          name: 'tpp',
          label: 'Financeur',
          field: 'thirdPartyPayer',
          align: 'left',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          field: row => formatIdentity(row.customer, 'fL'),
          align: 'left',
        },
        {
          name: 'referent',
          label: 'Référent',
          field: row => formatIdentity(row.referent, 'FL'),
          align: 'left',
        },
        {
          name: 'sector',
          label: 'Equipe',
          field: 'sector',
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
          align: 'center',
        },
        {
          name: 'plannedCareHours',
          label: 'Nb d\'heures',
          field: 'plannedCareHours',
          align: 'center',
        },
        {
          name: 'prevMonthCareHours',
          label: 'Mois précédent',
          field: 'prevMonthCareHours',
          align: 'center',
        },
        {
          name: 'currentMonthCareHours',
          label: 'Mois en cours',
          field: 'currentMonthCareHours',
          align: 'center',
        },
        {
          name: 'nextMonthCareHours',
          label: 'Mois prochain',
          field: 'nextMonthCareHours',
          align: 'center',
        },
      ],
    };
  },
  async mounted () {
    try {
      this.tableLoading = true;
      this.allCustomersFundingsMonitoring = await this.$stats.getAllCustomersFundingsMonitoring();
    } catch (e) {
      this.allCustomersFundingsMonitoring = [];
      this.tableLoading = true;
      NotifyNegative('Problème lors de la récupération des plans d\'aide');
    } finally {
      this.tableLoading = false;
    }
  },
}
</script>
