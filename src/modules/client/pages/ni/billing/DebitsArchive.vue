<template>
  <q-page class="client-background">
    <div class="title-padding">
      <h4>Archive Prélèvements</h4>
    </div>
    <div class="q-pa-sm">
      <ni-large-table :data="directDebits" :columns="columns" :pagination.sync="pagination" :loading="loading">
        <template v-slot:body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'download'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round icon="file_download" color="primary" @click="goToUrl(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-large-table>
    </div>
  </q-page>
</template>

<script>

import { mapGetters } from 'vuex';
import { openURL } from 'quasar';
import GoogleDrive from '@api/GoogleDrive';
import { NotifyNegative } from '@components/popup/notify';
import LargeTable from '@components/table/LargeTable';

export default {
  name: 'DebitArchive',
  metaInfo: { title: 'Archive prélèvements' },
  components: {
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      directDebits: [],
      loading: false,
      columns: [
        { name: 'name', label: 'Nom du fichier', align: 'left', field: 'name' },
        {
          name: 'createdTime',
          label: 'Date de création',
          align: 'left',
          field: row => (row.createdTime ? this.$moment(row.createdTime).format('DD/MM/YYYY') : ''),
        },
        { name: 'download', label: '', align: 'left', field: 'webViewLink' },
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
