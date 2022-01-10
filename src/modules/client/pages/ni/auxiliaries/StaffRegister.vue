<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Registre unique du personnel" padding />
    <ni-simple-table :data="staffRegister" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      row-key="_id">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name.match('idCardOrResidencePermit') && col.value !==''">
              <div class="row justify-center table-actions">
                <ni-button @click="downloadDriveDoc(col.value)" icon="file_download"
                  :disable="!col.value || docLoading" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import get from 'lodash/get';
import Contracts from '@api/Contracts';
import GoogleDrive from '@api/GoogleDrive';
import TitleHeader from '@components/TitleHeader';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import nationalities from '@data/nationalities';
import { CIVILITY_OPTIONS } from '@data/constants';
import { formatDate } from '@helpers/date';

const metaInfo = { title: 'Registre unique du personnel' };

export default {
  name: 'StaffRegister',
  components: {
    'ni-title-header': TitleHeader,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      staffRegister: [],
      tableLoading: false,
      pagination: { sortBy: 'startDate', descending: true, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => get(row, 'user.identity.lastname', '').toUpperCase(),
          align: 'left',
        },
        { name: 'firstname', label: 'Prénom', field: row => get(row, 'user.identity.firstname') || '', align: 'left' },
        {
          name: 'gender',
          label: 'Civilité',
          field: (row) => {
            const option = CIVILITY_OPTIONS.find(opt => opt.value === get(row, 'user.identity.title'));
            return option ? option.label : '';
          },
          align: 'left',
        },
        {
          name: 'birthDate',
          label: 'Date de naissance',
          field: row => get(row, 'user.identity.birthDate') || '',
          align: 'left',
          format: formatDate,
        },
        {
          name: 'nationality',
          label: 'Nationalité',
          field: row => nationalities[get(row, 'user.identity.nationality')] || '',
          align: 'left',
        },
        { name: 'job', label: 'Emploi', field: () => 'Auxiliaire de vie', align: 'left' },
        { name: 'contract', label: 'Type de contrat', field: () => 'CDI', align: 'center' },
        { name: 'startDate', label: 'Date de début', field: 'startDate', align: 'left', format: formatDate },
        { name: 'endDate', label: 'Date de fin', field: 'endDate', align: 'left', format: formatDate },
        {
          name: 'idCardOrResidencePermitRecto',
          label: 'Titre de séjour/Identité (R)',
          field: row => get(row, 'user.administrative.idCardRecto.driveId') ||
            get(row, 'user.administrative.residencePermitRecto.driveId') || '',
          align: 'left',
          style: 'width: 105px',
        },
        {
          name: 'idCardOrResidencePermitVerso',
          label: 'Titre de séjour/Identité (V)',
          field: row => get(row, 'user.administrative.idCardVerso.driveId') ||
            get(row, 'user.administrative.residencePermitVerso.driveId') || '',
          align: 'left',
          style: 'width: 105px',
        },
      ],
      docLoading: false,
    };
  },
  async created () {
    await this.getStaffRegister();
  },
  methods: {
    async getStaffRegister () {
      try {
        this.tableLoading = true;
        this.staffRegister = await Contracts.getStaffRegister();
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
        this.staffRegister = [];
      }
    },
    async downloadDriveDoc (driveId) {
      if (this.docLoading) return;
      try {
        this.docLoading = true;
        await GoogleDrive.downloadFileById(driveId);
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
      }
    },
  },
};
</script>
