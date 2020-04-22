<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire" @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredUsers" :columns="columns" :pagination.sync="pagination" :loading="tableLoading">
      <template v-slot:body="{ props, col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar><img :src="getAvatar(col.value.picture)" class="avatar" /></q-item-section>
          <q-item-section>{{ col.value.name }}</q-item-section>
        </q-item>
        <template v-else>
          <a v-if="col.value !== '-'" class="text-primary" :href="getPhoneLink(col.value)">{{col.value}}</a>
          <div v-if="col.value === '-'">{{ col.value }}</div>
        </template>
      </template>
    </ni-table-list>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { formatPhone, formatIdentity } from '@helpers/utils';
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
      pagination: {
        page: 1,
        rowsPerPage: 15,
        sortBy: 'name',
        descending: false,
      },
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
          format: (value) => formatPhone(value),
          style: 'width: 150px',
        },
      ],
    }
  },
  mounted () {
    this.getUserList();
  },
  computed: {
    ...mapGetters({ company: 'main/company' }),
    filteredUsers () {
      return this.userList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async getUserList () {
      try {
        this.tableLoading = true;
        const params = { role: [AUXILIARY, PLANNING_REFERENT] };
        const companyId = get(this.company, '_id') || null;
        if (companyId) params.company = companyId;
        const users = await Users.listActive(params);
        this.userList = users.map(user => ({
          auxiliary: { name: formatIdentity(user.identity, 'FL'), picture: get(user, 'picture.link') || null },
          phone: get(user, 'contact.phone') || '',
        }));
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
}
</script>
