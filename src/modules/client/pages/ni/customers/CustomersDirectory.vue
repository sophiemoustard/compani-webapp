<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire bénéficiaires" toggle-label="Clients" :toggle-value="onlyClients"
      display-toggle @updateSearch="updateSearch" @toggle="onlyClients = !onlyClients" :search="searchStr" />
    <ni-table-list :data="filteredCustomers" :columns="columns" :pagination.sync="pagination"
      @goTo="goToCustomerProfile" :loading="tableLoading">
      <template v-slot:body="{ props, col }">
        <q-item v-if="col.name === 'fullName'">
          <q-item-section>{{ col.value }}</q-item-section>
        </q-item>
        <template v-else-if="col.name === 'client'">
          <div :class="{ 'dot dot-active': col.value, 'dot dot-inactive': !col.value }" />
        </template>
        <template v-else-if="col.name === 'info'">
          <q-icon v-if="props.row.missingInfo" name="error" color="secondary" size="1rem" />
        </template>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un bénéficiaire"
      @click="customerCreationModal = true" :disable="tableLoading" />

    <!-- Customer creation modal -->
    <ni-modal v-model="customerCreationModal" @hide="resetForm">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">fiche bénéficiaire</span>
      </template>
      <ni-select in-modal v-model="newCustomer.identity.title" :error="$v.newCustomer.identity.title.$error"
        :options="civilityOptions" caption="Civilité" @blur="$v.newCustomer.identity.title.$touch" required-field />
      <ni-input in-modal v-model.trim="newCustomer.identity.lastname" :error="$v.newCustomer.identity.lastname.$error"
        caption="Nom" @blur="$v.newCustomer.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="newCustomer.identity.firstname" caption="Prénom" />
      <div class="row margin-input last">
        <ni-search-address v-model="newCustomer.contact.primaryAddress" in-modal required-field
          :error="$v.newCustomer.contact.primaryAddress.$error" :error-label="primaryAddressError"
          @blur="$v.newCustomer.contact.primaryAddress.$touch" />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary"
          :loading="loading" @click="createCustomer" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import Customers from '@api/Customers';
import { frAddress } from '@helpers/vuelidateCustomVal.js';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import DirectoryHeader from '@components/DirectoryHeader';
import Modal from '@components/modal/Modal';
import TableList from '@components/table/TableList';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify.js';
import { REQUIRED_LABEL, CIVILITY_OPTIONS } from '@data/constants';
import { customerProfileValidation } from 'src/modules/client/helpers/customerProfileValidation.js';
import { validationMixin } from 'src/modules/client/mixins/validationMixin.js';

export default {
  name: 'CustomersDirectory',
  metaInfo: { title: 'Répertoire bénéficiaires' },
  mixins: [validationMixin],
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-directory-header': DirectoryHeader,
    'ni-modal': Modal,
    'ni-table-list': TableList,
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
        email: '',
        contact: {
          primaryAddress: { fullAddress: '' },
        },
      },
      customers: [],
      searchStr: '',
      onlyClients: false,
      pagination: {
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'fullName',
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
          style: 'width: 350px',
        },
        {
          name: 'createdAt',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'N/A',
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 85px',
        },
        {
          name: 'firstIntervention',
          label: '1ère intervention',
          field: 'firstIntervention',
          align: 'left',
          sortable: false,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
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
          name: 'client',
          label: 'Client',
          field: 'firstIntervention',
          align: 'right',
          sortable: false,
          style: 'width: 30px',
        },
      ],
    }
  },
  validations: {
    newCustomer: {
      identity: {
        title: { required },
        lastname: { required },
      },
      email: { email },
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
    await this.refresh();
  },
  computed: {
    filteredCustomers () {
      const customers = this.onlyClients ? this.customers.filter(customer => customer.firstIntervention) : this.customers;
      return customers.filter(customer => customer.identity.fullName.match(new RegExp(this.searchStr, 'i')));
    },
    primaryAddressError () {
      return !this.$v.newCustomer.contact.primaryAddress.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refresh () {
      await Promise.all([this.getCustomers(), this.getCustomersFirstIntervention()]);
    },
    async getCustomers () {
      try {
        this.tableLoading = true;
        this.customers = await Customers.list();
      } catch (e) {
        this.customers = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    async getCustomersFirstIntervention () {
      try {
        this.firstInterventions = await Customers.listWithFirstIntervention();
        this.customers = this.customers.map(customer => ({
          ...customer,
          firstIntervention: get(this.firstInterventions[customer._id], 'firstIntervention.startDate', ''),
          missingInfo: customerProfileValidation(customer).error !== null,
        }));
      } catch (e) {
        this.firstInterventions = [];
        console.error(e);
      }
    },
    goToCustomerProfile (customer) {
      this.$router.push({ name: 'customers profile', params: { customerId: customer._id } });
    },
    resetForm () {
      this.$v.newCustomer.$reset();
      this.newCustomer = {
        identity: { title: '', lastname: '', firstname: '' },
        email: '',
        contact: {
          primaryAddress: { fullAddress: '' },
        },
      };
    },
    async createCustomer () {
      try {
        this.loading = true;
        this.$v.newCustomer.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newCustomer);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const payload = pickBy(this.newCustomer);
        await Customers.create(payload);

        await this.refresh();
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
  },
}
</script>
