<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire" @updateSearch="updateSearch" :search="searchStr" />
    <q-table :data="filteredUsers" :columns="columns" row-key="name" :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="people-list" card-class="neutral-background" flat
      binary-state-sort>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-section avatar><img :src="getAvatar(col.value.picture)" class="avatar" /></q-item-section>
            <q-item-section>{{ col.value.name }}</q-item-section>
          </q-item>
          <template v-else>
            <a v-if="col.value !== '-'" class="text-primary" :href="getPhoneLink(col.value)">{{col.value}}</a>
            <div v-if="col.value === '-'">{{ col.value }}</div>
          </template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>
import { DEFAULT_AVATAR, AUXILIARY, PLANNING_REFERENT } from '../../../data/constants';
import DirectoryHeader from '../../../components/DirectoryHeader';
import { formatPhone, formatIdentity } from '../../../helpers/utils';

export default {
  name: 'TeamDirectory',
  metaInfo: { title: 'Répertoire équipe' },
  components: {
    'ni-directory-header': DirectoryHeader,
  },
  data () {
    return {
      tableLoading: true,
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
    currentUser () {
      return this.$store.getters['main/user'];
    },
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
        const users = await this.$users.showAllActive({ role: [AUXILIARY, PLANNING_REFERENT] });
        this.userList = users.map(user => ({
          auxiliary: {
            name: formatIdentity(user.identity, 'FL'),
            picture: user.picture ? user.picture.link : null,
          },
          phone: user.contact.phone,
        }));
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
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
