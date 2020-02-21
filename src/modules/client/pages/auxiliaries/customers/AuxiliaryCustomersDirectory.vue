<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Bénéficiaires" @updateSearch="updateSearch" :search="searchStr" />
    <q-table :data="filteredUsers" :columns="columns" row-key="name" :rows-per-page-options="[]" binary-state-sort
      :pagination.sync="pagination" :loading="tableLoading" class="people-list neutral-background" flat>
      <q-tr slot="body" slot-scope="props" :props="props" @click.native="goToCustomerProfile(props.row.customerId)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>
import Customers from '@api/Customers';
import { formatIdentity } from '@helpers/utils';
import DirectoryHeader from '@components/DirectoryHeader';

export default {
  name: 'AuxiliaryCustomersDirectory',
  metaInfo: { title: 'Bénéficiaires' },
  components: {
    'ni-directory-header': DirectoryHeader,
  },
  data () {
    return {
      tableLoading: true,
      ownCustomers: true,
      customersList: [],
      searchStr: '',
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'identity',
          format: value => value ? value.fullName : '',
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aLastname = a.lastname;
            const bLastname = b.lastname;
            return aLastname.toLowerCase() < bLastname.toLowerCase() ? -1 : 1
          },
        },
      ],
    }
  },
  async mounted () {
    await this.getCustomersList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    filteredUsers () {
      return this.customersList.filter(customer => customer.identity.fullName.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async getCustomersList () {
      try {
        this.tableLoading = true;
        const customers = await Customers.list();
        this.customersList = customers.map(customer => ({
          identity: { ...customer.identity, fullName: formatIdentity(customer.identity, 'FL') },
          customerId: customer._id,
        }));
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToCustomerProfile (customerId) {
      this.$router.push({ name: 'profile customers info', params: { id: this.currentUser._id, customerId } });
    },
  },
}
</script>
