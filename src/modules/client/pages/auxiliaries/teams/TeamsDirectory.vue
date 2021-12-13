<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredUsers" :columns="columns" :pagination.sync="pagination" :loading="tableLoading"
      :rows-per-page="[15, 50, 100, 200]">
      <template #body="{ col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar><img :src="getAvatar(col.value.picture)" class="avatar"></q-item-section>
          <q-item-section>
            {{ col.value.name }}
            <div class="sector-label">{{ col.value.sector }}</div>
          </q-item-section>
        </q-item>
        <template v-else>
          <a v-if="col.value !== '-'" class="text-primary" :href="getPhoneLink(col.value)">{{ col.value }}</a>
          <div v-if="col.value === '-'">{{ col.value }}</div>
        </template>
      </template>
    </ni-table-list>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { formatPhone, formatIdentity, removeDiacritics } from '@helpers/utils';
import { DEFAULT_AVATAR, AUXILIARY, PLANNING_REFERENT } from '@data/constants';

export default {
  name: 'TeamDirectory',
  metaInfo: { title: 'Répertoire équipe' },
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  data () {
    return {
      tableLoading: false,
      userList: [],
      searchStr: '',
      activeUsers: true,
      pagination: { page: 1, rowsPerPage: 15, sortBy: 'name', descending: false },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.auxiliary,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.name.localeCompare(b.name),
          style: 'width: 300px',
        },
        {
          name: 'phone',
          label: 'Numéro de téléphone',
          field: 'phone',
          align: 'left',
          sortable: false,
          format: value => formatPhone(value),
          style: 'width: 150px',
        },
      ],
    };
  },
  created () {
    this.getUserList();
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
    filteredUsers () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.userList.filter(user => user.auxiliary.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    formatUser (user) {
      const formattedName = formatIdentity(user.identity, 'FL');

      return {
        auxiliary: {
          name: formattedName,
          picture: get(user, 'picture.link') || null,
          noDiacriticsName: removeDiacritics(formattedName),
          sector: get(user, 'sector.name') || '',
        },
        phone: get(user, 'contact.phone') || '',
      };
    },
    async getUserList () {
      try {
        this.tableLoading = true;
        const params = { role: [AUXILIARY, PLANNING_REFERENT] };
        const companyId = get(this.company, '_id') || null;
        if (companyId) params.company = companyId;
        const users = await Users.listActive(params);

        this.userList = users.map(user => this.formatUser(user));
      } catch (e) {
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
    getPhoneLink (link) {
      return link ? `tel:+33${link.substring(1)}` : '-';
    },
  },
};
</script>

<style lang="sass" scoped>
.sector-label
  color: $copper-grey-400
  font-size: 14px
</style>
