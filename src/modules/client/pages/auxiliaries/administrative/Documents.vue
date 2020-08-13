<template>
  <q-page padding class="client-background">
    <h4>Documents</h4>
    <p v-if="documents.length == 0">Aucun document disponible</p>
    <ni-large-table :data="documents" :columns="columns" :pagination.sync="pagination" row-key="name"
      :loading="loading">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row justify-center table-actions">
                <q-btn flat round small color="primary" class="q-mx-sm" :disable="!getDriveFileLink(props)" type="a"
                  :href="getDriveFileLink(props)" target="_blank" icon="file_download" />
              </div>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
      </template>
    </ni-large-table>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import AdministrativeDocument from '@api/AdministrativeDocuments';
import LargeTable from '@components/table/LargeTable';

export default {
  metaInfo: { title: 'Documents' },
  components: {
    'ni-large-table': LargeTable,
  },
  async mounted () {
    try {
      this.loading = true;
      this.documents = await AdministrativeDocument.list();
    } catch (e) {
      console.error(e);
      this.documents = [];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getDriveFileLink (doc) {
      return get(doc, 'row.driveFile.link', '');
    },
  },
  data () {
    return {
      pagination: { sortBy: 'title', descending: false, rowsPerPage: 0 },
      loading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
        },
        {
          name: 'actions',
          align: 'center',
        },
      ],
      documents: [],
    };
  },
};
</script>
