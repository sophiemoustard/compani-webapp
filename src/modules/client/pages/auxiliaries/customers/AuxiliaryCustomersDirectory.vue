<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Bénéficiaires" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredUsers" :columns="columns" v-model:pagination="pagination" :loading="tableLoading"
      @go-to="goToCustomerProfile" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import Customers from '@api/Customers';
import escapeRegExp from 'lodash/escapeRegExp';
import { formatIdentity, removeDiacritics, sortStrings } from '@helpers/utils';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';

const metaInfo = { title: 'Bénéficiaires' };

export default {
  name: 'AuxiliaryCustomersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      tableLoading: true,
      ownCustomers: true,
      customersList: [],
      searchStr: '',
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'identity',
          format: value => (value ? value.fullName : ''),
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
        },
      ],
    };
  },
  async created () {
    await this.getCustomersList();
  },
  computed: {
    filteredUsers () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.customersList
        .filter(customer => customer.identity.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    formatCustomer (customer) {
      const formattedName = formatIdentity(customer.identity, 'FL');

      return {
        identity: {
          ...customer.identity,
          fullName: formattedName,
          noDiacriticsName: removeDiacritics(formattedName),
        },
        customerId: customer._id,
      };
    },
    async getCustomersList () {
      try {
        this.tableLoading = true;
        const customers = await Customers.list();
        this.customersList = customers.map(customer => this.formatCustomer(customer));
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToCustomerProfile (row) {
      this.$router.push({ name: 'auxiliaries customers info', params: { customerId: row.customerId } });
    },
  },
};
</script>
