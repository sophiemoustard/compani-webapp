<template>
  <q-page padding class="neutral-background">
    <h4>Documents</h4>
    <p v-if="documents.length == 0">Aucun document disponible</p>
    <q-table binary-state-sort :data="documents" :columns="columns" row-key="name"
      hide-bottom card-class="neutral-background people-list" flat>
      <q-td slot="body-cell-title" slot-scope="props" :props="props">
        {{ props.value }}
      </q-td>
      <q-td slot="body-cell-link" slot-scope="props" :props="props">
        <q-btn flat round small color="primary">
          <a :href="props.value">
            <q-icon name="file_download" />
          </a>
        </q-btn>
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
export default {
  metaInfo: {
    title: 'Documents',
  },
  data () {
    return {
      documents: [
        {
          title: 'Conditions de remboursement de mutuelle',
          link: 'https://drive.google.com/file/d/0B9x9rvBHVX1TTWlPbHpFZlpUVzQ/view?usp=sharing',
        },
        {
          title: 'Convention collective des services à la personne',
          link: 'https://drive.google.com/open?id=0B3bqjy-Bj6OHeWx5RVZLYjM5eGM',
        },
        {
          title: 'Evaluation des risques professionnels',
          link: 'https://drive.google.com/drive/folders/0B9x9rvBHVX1TQ2VVZ3cxb0ZsYVE',
        },
      ],
      pagination: {
        sortBy: 'title',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      columns: [
        {
          name: 'title',
          label: 'Titre',
          field: 'title',
          align: 'left',
          sortable: true,
          style: 'width: 170px',
        },
        {
          name: 'link',
          label: 'Visualiser',
          field: 'link',
          align: 'left',
          style: 'width: 30px',
        },
      ],
    }
  },
}
</script>

<style lang="stylus" scoped>
/deep/ .q-table
  & td
    font-size: 16px;
</style>
