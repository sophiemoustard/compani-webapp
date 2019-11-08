<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Registre unique du personnel</h4>
    </div>
    <ni-large-table :data="staffRegister" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      row-key="_id">
      <template v-slot:body="{ props }" >
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name.match('idCardOrResidencePermit') && col.value !==''">
                <div  class="row justify-center table-actions">
                  <q-btn flat round small color="primary">
                    <a :href="col.value" target="_blank">
                      <q-icon name="file_download" />
                    </a>
                  </q-btn>
                </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-large-table>
  </q-page>
</template>

<script>
import nationalities from '../../../data/nationalities.js';
import { CIVILITY_OPTIONS } from '../../../data/constants';
import LargeTable from '../../../components/table/LargeTable';

export default {
  name: 'StaffRegister',
  metaInfo: {
    title: 'Registre unique du personnel',
  },
  components: {
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      staffRegister: [],
      tableLoading: false,
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => this.$_.get(row, 'user.identity.lastname', '').toUpperCase(),
          align: 'left',
        },
        {
          name: 'firstname',
          label: 'Prénom',
          field: row => this.$_.get(row, 'user.identity.firstname', ''),
          align: 'left',
        },
        {
          name: 'gender',
          label: 'Civilité',
          field: row => {
            const option = CIVILITY_OPTIONS.find(opt => opt.value === this.$_.get(row, 'user.identity.title'));
            return option ? option.label : ''
          },
          align: 'left',
        },
        {
          name: 'birthDate',
          label: 'Date de naissance',
          field: row => this.$_.get(row, 'user.identity.birthDate', ''),
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'nationality',
          label: 'Nationalité',
          field: row => nationalities[this.$_.get(row, 'user.identity.nationality', '')],
          align: 'left',
        },
        {
          name: 'job',
          label: 'Emploi',
          field: row => 'Auxiliaire de vie',
          align: 'left',
        },
        {
          name: 'contract',
          label: 'Type de contrat',
          field: row => 'CDI',
          align: 'center',
        },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'idCardOrResidencePermitRecto',
          label: 'Titre de séjour/Identité (R)',
          field: row => this.$_.has(row, 'user.administrative.idCardRecto.link') ? this.$_.get(row, 'user.administrative.idCardRecto.link', '') : this.$_.get(row, 'user.administrative.residencePermitRecto.link', ''),
          align: 'left',
          style: 'width: 105px',
        },
        {
          name: 'idCardOrResidencePermitVerso',
          label: 'Titre de séjour/Identité (V)',
          field: row => this.$_.has(row, 'user.administrative.idCardVerso.link') ? this.$_.get(row, 'user.administrative.idCardVerso.link', '') : this.$_.get(row, 'user.administrative.residencePermitVerso.link', ''),
          align: 'left',
          style: 'width: 105px',
        },
      ],
    }
  },
  async mounted () {
    await this.getStaffRegister();
  },
  methods: {
    async getStaffRegister () {
      try {
        this.tableLoading = true;
        this.staffRegister = await this.$contracts.getStaffRegister();
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
        this.staffRegister = [];
      }
    },
  },
}
</script>
