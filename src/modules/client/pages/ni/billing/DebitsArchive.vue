<template>
  <q-page class="client-background">
    <ni-title-header title="Archive Prélèvements" padding />
    <div class="q-pa-sm">
      <ni-simple-table :data="directDebits" :columns="columns" v-model:pagination="pagination" :loading="loading">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'download'">
                <div class="row no-wrap table-actions">
                  <ni-button icon="file_download" @click="downloadDriveDoc(col.value, props.row.name)"
                    :disable="docLoading" />
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
import { openURL, createMetaMixin } from 'quasar';
import { mapGetters } from 'vuex';
import GoogleDrive from '@api/GoogleDrive';
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative } from '@components/popup/notify';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import { formatDate } from '@helpers/date';
import { formatDownloadName } from '@helpers/utils';

const metaInfo = { title: 'Archive prélèvements' };

export default {
  name: 'DebitArchive',
  components: {
    'ni-title-header': TitleHeader,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      directDebits: [],
      loading: false,
      docLoading: false,
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
  async created () {
    await this.getDirectDebits();
  },
  methods: {
    goToUrl (url) {
      openURL(url);
    },
    async downloadDriveDoc (docId, name) {
      try {
        this.docLoading = true;
        const docName = formatDownloadName(name);

        await GoogleDrive.downloadFileById(docId, docName);
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
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
