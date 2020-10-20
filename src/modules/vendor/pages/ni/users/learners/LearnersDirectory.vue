<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @go-to="goToLearnerProfile">
      <template v-slot:body="{ col }">
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
import escapeRegExp from 'lodash/escapeRegExp';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity, removeDiacritics } from '@helpers/utils';
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
          sort: (a, b) => {
            const aLastnameLower = a.lastname.toLowerCase();
            const bLastnameLower = b.lastname.toLowerCase();
            return aLastnameLower.localeCompare(bLastnameLower);
          },
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
          name: 'blendedCoursesCount',
          label: 'Formations suivies',
          field: 'blendedCoursesCount',
          align: 'center',
          sortable: true,
          style: 'min-width: 110px; width: 15%',
          sort: (a, b) => b - a,
        },
      ],
    };
  },
  computed: {
    filteredLearners () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.learnerList.filter(user => user.learner.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async created () {
    await this.getLearnerList();
  },
  methods: {
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni users learners info', params: { learnerId: row.learner._id } });
    },
    updateSearch (value) {
      this.searchStr = value;
    },
    formatRow (user) {
      const formattedName = formatIdentity(user.identity, 'FL');

      return {
        learner: {
          _id: user._id,
          fullName: formattedName,
          lastname: user.identity.lastname,
          picture: user.picture ? user.picture.link : null,
          noDiacriticsName: removeDiacritics(formattedName),
        },
        company: user.company ? user.company.name : 'N/A',
        blendedCoursesCount: user.blendedCoursesCount,
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
};
</script>
