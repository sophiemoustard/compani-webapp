<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire apprenants" @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination">
      <template v-slot:body="{ props, col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar>
            <img class="avatar" :src="getAvatar(col.value.picture)">
          </q-item-section>
          <q-item-section>{{ col.value.fullName }}</q-item-section>
        </q-item>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
  </q-page>
</template>

<script>
import Users from '@api/Users';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';

export default {
  metaInfo: { title: 'Répertoire apprenants' },
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  mixins: [userMixin],
  data () {
    return {
      tableLoading: false,
      loading: false,
      learnerList: [],
      searchStr: '',
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.learner,
          align: 'left',
          sortable: true,
          sort: (a, b) => { return a.lastname.toLowerCase() < b.lastname.toLowerCase() ? -1 : 1 },
          style: 'min-width: 200px; width: 35%',
        },
        {
          name: 'company',
          label: 'Structure',
          field: 'company',
          align: 'left',
          sortable: true,
          style: 'min-width: 100px; width: 15%',
        },
        {
          name: 'coursesCount',
          label: 'Formations suivies',
          field: 'coursesCount',
          align: 'center',
          style: 'min-width: 110px; width: 15%',
        },
      ],
    }
  },
  computed: {
    filteredLearners () {
      return this.learnerList.filter(user => user.learner.fullName.match(new RegExp(this.searchStr, 'i')));
    },
  },
  async created () {
    await this.getLearnerList();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    formatRow (user) {
      return {
        learner: {
          fullName: formatIdentity(user.identity, 'FL'),
          lastname: user.identity.lastname,
          picture: user.picture ? user.picture.link : null,
        },
        company: user.company ? user.company.name : 'N/A',
        coursesCount: user.coursesCount,
      };
    },
    async getLearnerList () {
      try {
        this.tableLoading = true;
        const learners = await Users.learnerList();
        this.learnerList = Object.freeze(learners.map(this.formatRow));
      } catch (e) {
        console.error(e);
        this.learnerList = [];
      } finally {
        this.tableLoading = false;
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>
