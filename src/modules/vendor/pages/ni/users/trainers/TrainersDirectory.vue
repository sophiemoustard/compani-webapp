<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formateurs" search-placeholder="Rechercher un formateur"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredTrainers" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"/>
  </q-page>
</template>

<script>
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';
import { TRAINER } from '@data/constants';

export default {
  metaInfo: { title: 'Répertoire formateurs' },
  name: 'TrainersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  data () {
    return {
      trainers: [],
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
        },
      ],
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15,
      },
      searchStr: '',
    }
  },
  async mounted () {
    await this.refreshTrainers();
  },
  computed: {
    filteredTrainers () {
      return this.trainers.filter(trainer => trainer.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshTrainers () {
      try {
        this.tableLoading = true;
        const trainers = await Users.list({ role: [TRAINER] });
        this.trainers = trainers.map(trainer => ({ ...trainer, name: formatIdentity(trainer.identity, 'FL') }))
      } catch (e) {
        console.error(e);
        this.trainers = [];
        NotifyNegative('Erreur lors de la récupération des formateurs');
      } finally {
        this.tableLoading = false;
      }
    },
  },
}
</script>
