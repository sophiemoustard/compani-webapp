<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formateurs" search-placeholder="Rechercher un formateur"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredTrainer" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"/>
  </q-page>
</template>

<script>

import { mapGetters } from 'vuex';
import get from 'lodash/get';
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative } from '@components/popup/notify';
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
    ...mapGetters({ currentUser: 'current/user' }),
    filteredTrainer () {
      return this.trainers.filter(trainer => trainer.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshTrainers () {
      try {
        const params = { role: [TRAINER] };
        const companyId = get(this.currentUser, 'company._id');
        if (companyId) params.company = companyId;
        const trainers = await Users.list(params);

        this.trainers = trainers.map(trainer =>
          ({ ...trainer, name: `${trainer.identity.firstname} ${trainer.identity.lastname}` }))
      } catch (e) {
        console.error(e);
        this.trainers = [];
        NotifyNegative('Erreur lors de la récupération des structures');
      }
    },
  },
}
</script>
