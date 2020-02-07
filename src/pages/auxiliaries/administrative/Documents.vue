<template>
  <q-page padding class="neutral-background">
    <h4>Documents</h4>
    <p v-if="documents.length == 0">Aucun document disponible</p>
    <ni-large-table :data="documents" :columns="columns" :pagination.sync="pagination" row-key="name">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row justify-center table-actions">
                <q-btn flat round small color="primary" class="q-mx-sm" :disable="loading">
                  <a :href="$_.get(props, 'row.driveFile.link', '')" target="_blank">
                    <q-icon name="file_download" color="primary" />
                  </a>
                </q-btn>
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
import LargeTable from '../../../components/table/LargeTable';
import AdministrativeDocument from '../../../api/AdministrativeDocuments'

export default {
  metaInfo: {
    title: 'Documents',
  },
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
  data () {
    return {
      pagination: { sortBy: 'title', descending: false, rowsPerPage: 0 },
      loading: false,
      columns: [
        {
          name: 'nom',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
        },
        {
          name: 'actions',
          label: 'Visualiser',
          field: 'link',
          align: 'center',
          style: 'width: 30px',
        },
      ],
      documents: [],
    }
  },
}
</script>
