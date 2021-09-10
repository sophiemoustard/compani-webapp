<template>
  <q-page class="client-background">
    <ni-title-header title="Archive Prélèvements" padding />
    <div class="q-pa-sm">
      <ni-simple-table :data="directDebits" :columns="columns" :pagination.sync="pagination" :loading="loading">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'download'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round icon="file_download" color="primary" @click="downloadDriveDoc(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
    </div>
  </q-page>
</template>

<script>

import { mapGetters } from 'vuex';
import { openURL } from 'quasar';
import GoogleDrive from '@api/GoogleDrive';
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative } from '@components/popup/notify';
import SimpleTable from '@components/table/SimpleTable';
import { formatDate } from '@helpers/date';

export default {
  name: 'DebitArchive',
  metaInfo: { title: 'Archive prélèvements' },
  components: {
    'ni-title-header': TitleHeader,
    'ni-simple-table': SimpleTable,
  },
  data () {
    return {
      directDebits: [],
      loading: false,
      columns: [
        { name: 'name', label: 'Nom du fichier', align: 'left', field: 'name' },
        { name: 'createdTime', label: 'Date de création', align: 'left', field: 'createdTime', format: formatDate },
        { name: 'download', label: '', align: 'left', field: 'id' },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'createdTime',
        descending: true,
      },
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  async mounted () {
    await this.getDirectDebits();
  },
  methods: {
    goToUrl (url) {
      openURL(url);
    },
    async downloadDriveDoc (docId) {
      try {
        this.loading = true;
        await GoogleDrive.downloadFileById(docId);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async getDirectDebits () {
      try {
        this.loading = true;
        if (!this.company || !this.company.directDebitsFolderId) {
          return NotifyNegative('Dossier de prélèvement manquant.');
        }
        this.directDebits = await GoogleDrive.getList({ folderId: this.company.directDebitsFolderId });
      } catch (e) {
        this.directDebits = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des prélèvements d\'archive.');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
