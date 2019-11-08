<template>
  <q-page class="neutral-background">
    <div class="title-padding">
      <h4>Archive Prélèvements</h4>
    </div>
    <div class="q-pa-sm">
      <ni-large-table :data="directDebits" :columns="columns" :pagination.sync="pagination">
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
import { openURL } from 'quasar';
import { NotifyNegative } from '../../../components/popup/notify'
import LargeTable from '../../../components/table/LargeTable';

export default {
  name: 'DebitArchive',
  metaInfo: { title: 'Archive prélèvements' },
  components: {
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      directDebits: [],
      columns: [
        {
          name: 'name',
          label: 'Nom du fichier',
          align: 'left',
          field: 'name',
        },
        {
          name: 'createdTime',
          label: 'Date de création',
          align: 'left',
          field: row => row.createdTime ? this.$moment(row.createdTime).format('DD/MM/YYYY') : '',
        },
        {
          name: 'download',
          label: '',
          align: 'left',
          field: 'webViewLink',
        },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'createdTime',
        descending: true,
      },
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
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
        if (!this.user.company || !this.user.company.directDebitsFolderId) return NotifyNegative('Dossier de prélèvement manquant');
        this.directDebits = await this.$gdrive.getList({ folderId: this.user.company.directDebitsFolderId });
      } catch (e) {
        this.directDebits = [];
        console.error(e);
        NotifyNegative("Erreur lors de la récupération des prélèvements d'archive");
      }
    },
  },
}
</script>
