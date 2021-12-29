<template>
  <q-page padding class="client-background">
    <ni-title-header title="Documents" class="q-mb-xl" />
    <p v-if="documents.length == 0">Aucun document disponible</p>
    <ni-simple-table :data="documents" :columns="columns" v-model:pagination="pagination" row-key="name"
      :loading="loading">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row justify-center table-actions">
                <ni-button :disable="docLoading || !getDriveId(props.row)" @click="downloadDriveDoc(props.row)"
                  icon="file_download" />
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
import get from 'lodash/get';
import AdministrativeDocuments from '@api/AdministrativeDocuments';
import GoogleDrive from '@api/GoogleDrive';
import TitleHeader from '@components/TitleHeader';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';

export default {
  metaInfo: { title: 'Documents' },
  components: {
    'ni-title-header': TitleHeader,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },

  data () {
    return {
      pagination: { sortBy: 'title', descending: false, rowsPerPage: 0 },
      loading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left' },
        { name: 'actions', align: 'center' },
      ],
      documents: [],
      docLoading: false,
    };
  },
  async mounted () {
    try {
      this.loading = true;
      this.documents = await AdministrativeDocuments.list();
    } catch (e) {
      console.error(e);
      this.documents = [];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getDriveId (doc) {
      return get(doc, 'driveFile.driveId') || '';
    },
    async downloadDriveDoc (doc) {
      if (this.docLoading) return;
      try {
        this.docLoading = true;
        await GoogleDrive.downloadFileById(this.getDriveId(doc));
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
      }
    },
  },
};
</script>
