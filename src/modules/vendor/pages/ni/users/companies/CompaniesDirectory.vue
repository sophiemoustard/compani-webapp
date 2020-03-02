<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure"
      @updateSearch="updateSearch" :search="searchStr" />
    <q-table :data="filteredCompanies" :columns="columns" row-key="name" binary-state-sort flat :loading="tableLoading"
      :pagination.sync="pagination" class="people-list neutral-background" />
  </q-page>
</template>

<script>
import Companies from '@api/Companies';
import DirectoryHeader from '@components/DirectoryHeader';
import { NotifyNegative } from '@components/popup/notify';

export default {
  metaInfo: { title: 'Répertoire structures' },
  name: 'CompaniesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
  },
  data () {
    return {
      companies: [],
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
      ],
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      searchStr: '',
    }
  },
  async mounted () {
    await this.refreshCompanies();
  },
  computed: {
    filteredCompanies () {
      return this.companies.filter(company => company.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshCompanies () {
      try {
        this.companies = await Companies.list();
      } catch (e) {
        console.error(e);
        this.companies = [];
        NotifyNegative('Erreur lors de la récupération des structures');
      }
    },
  },
}
</script>
