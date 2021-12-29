<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire bénéficiaires" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCustomers" :columns="columns" v-model:pagination="pagination"
      @go-to="goToCustomerProfile" :loading="tableLoading" :rows-per-page="[15, 50, 100, 200]">
      <template #body="{ props, col }">
        <q-item v-if="col.name === 'fullName'">
          <q-item-section>{{ col.value }}</q-item-section>
        </q-item>
        <template v-else-if="col.name === 'info'">
          <q-icon v-if="props.row.missingInfo" name="error" color="secondary" size="1rem" />
        </template>
        <template v-else-if="col.name === 'status'">
          <div :class="getDotClass(col.value)" />
        </template>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="customerCreationModal = true" :disable="tableLoading" />

    <customer-creation-modal v-model="customerCreationModal" v-model:new-customer="newCustomer" :loading="loading"
      :validations="v$.newCustomer" :civility-options="civilityOptions" @hide="resetForm" @submit="createCustomer" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';
import Customers from '@api/Customers';
import { frAddress } from '@helpers/vuelidateCustomVal';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { CIVILITY_OPTIONS, ACTIVATED, STOPPED, ARCHIVED } from '@data/constants';
import { formatIdentity, removeDiacritics, sortStrings } from '@helpers/utils';
import { formatDate, ascendingSort } from '@helpers/date';
import { validationMixin } from '@mixins/validationMixin';
import { customerMixin } from 'src/modules/client/mixins/customerMixin';
import CustomerCreationModal from 'src/modules/client/components/customers/CustomerCreationModal';
import { customerProfileValidation } from 'src/modules/client/helpers/customerProfileValidation';

export default {
  name: 'CustomersDirectory',
  mixins: [validationMixin, customerMixin],
  components: {
    'ni-directory-header': DirectoryHeader,
    'customer-creation-modal': CustomerCreationModal,
    'ni-table-list': TableList,
  },
  setup () {
    const metaInfo = { title: 'Répertoire bénéficiaires' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  data () {
    return {
      userCreated: null,
      tableLoading: false,
      loading: false,
      customerCreationModal: false,
      sendWelcomeMsg: true,
      civilityOptions: CIVILITY_OPTIONS,
      firstInterventions: [],
      newCustomer: {
        identity: {
          title: '',
          lastname: '',
          firstname: '',
        },
        contact: {
          primaryAddress: { fullAddress: '' },
        },
      },
      customers: [],
      searchStr: '',
      pagination: { sortBy: 'createdAt', descending: true, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'fullName',
          label: 'Nom',
          field: 'identity',
          format: value => (value ? value.fullName : ''),
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'width: 350px',
        },
        {
          name: 'createdAt',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: value => formatDate(value) || 'N/A',
          sort: ascendingSort,
          style: 'width: 85px',
        },
        {
          name: 'stoppedAt',
          label: 'Arrêté le...',
          field: 'stoppedAt',
          align: 'left',
          sortable: true,
          format: value => formatDate(value) || '',
          sort: ascendingSort,
          style: 'width: 85px',
        },
        {
          name: 'firstIntervention',
          label: '1ère intervention',
          field: 'firstIntervention',
          align: 'left',
          sortable: false,
          format: formatDate,
          style: 'width: 85px',
        },
        {
          name: 'info',
          label: 'Infos',
          field: 'missingInfo',
          align: 'left',
          sortable: true,
          sort: (a, b) => a - b,
          style: 'width: 30px',
        },
        {
          name: 'status',
          label: 'Statut',
          field: row => this.getStatus(row),
          align: 'center',
          sortable: false,
          style: 'width: 30px',
        },
      ],
    };
  },
  validations: {
    newCustomer: {
      identity: {
        title: { required },
        lastname: { required },
      },
      contact: {
        primaryAddress: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { required, frAddress },
        },
      },
    },
  },
  async mounted () {
    await this.getCustomers();
  },
  computed: {
    filteredCustomers () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.customers
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
        ...customer,
        identity: {
          ...customer.identity,
          fullName: formattedName,
          noDiacriticsName: removeDiacritics(formattedName),
        },
        firstIntervention: get(this.firstInterventions[customer._id], 'firstIntervention.startDate', ''),
        missingInfo: !!customerProfileValidation(customer).error,
      };
    },
    async getCustomers () {
      try {
        this.tableLoading = true;
        const [customers, firstInterventions] = await Promise.all([
          Customers.list(),
          Customers.listWithFirstIntervention(),
        ]);
        this.firstInterventions = Object.freeze(firstInterventions);
        this.customers = Object.freeze(customers.map(customer => this.formatCustomer(customer)));
      } catch (e) {
        this.customers = [];
        this.firstInterventions = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    goToCustomerProfile (customer) {
      this.$router.push({ name: 'ni customers info', params: { customerId: customer._id } });
    },
    resetForm () {
      this.v$.newCustomer.$reset();
      this.newCustomer = {
        identity: { title: '', lastname: '', firstname: '' },
        contact: {
          primaryAddress: { fullAddress: '' },
        },
      };
    },
    async createCustomer () {
      try {
        this.loading = true;
        this.v$.newCustomer.$touch();
        const isValid = await this.waitForFormValidation(this.v$.newCustomer);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.newCustomer;
        await Customers.create(payload);

        await this.getCustomers();
        this.customerCreationModal = false;
        NotifyPositive('Fiche bénéficiaire créée');
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') return NotifyWarning('Champ(s) invalide(s)');
        NotifyNegative('Erreur lors de la création de la fiche bénéficiaire.');
      } finally {
        this.loading = false;
      }
    },
    getDotClass (value) {
      return {
        'dot dot-active': value === ACTIVATED,
        'dot dot-error': value === STOPPED,
        'dot dot-archived': value === ARCHIVED,
      };
    },
  },
};
</script>
<style lang="sass" scoped>
  .dot
    margin: 0px
</style>
