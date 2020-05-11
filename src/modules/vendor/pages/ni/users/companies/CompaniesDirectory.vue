<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCompanies" :columns="columns" :loading="tableLoading"
      :pagination.sync="pagination" @goTo="goToCompanyProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="companyCreationModal = true" :disable="tableLoading" />

    <!-- Company creation modal -->
    <ni-modal v-model="companyCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">structure</span>
      </template>
      <ni-input in-modal v-model.trim="newCompany.name" :error="$v.newCompany.name.$error"
        @blur="$v.newCompany.name.$touch" required-field caption="Raison sociale" />
      <ni-input in-modal v-model.trim="newCompany.tradeName" :error="$v.newCompany.tradeName.$error"
        caption="Nom commercial" @blur="$v.newCompany.tradeName.$touch" required-field
        :error-label="tradeNameError($v.newCompany)" />
      <ni-option-group v-model="newCompany.type" type="radio" :options="companyTypeOptions" inline caption="Type"
        required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la structure" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCompany" :disable="$v.newCompany.$anyError || !$v.newCompany.$anyDirty" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import pick from 'lodash/pick';
import Companies from '@api/Companies';
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { COMPANY_TYPES } from '@data/constants';
import { companyMixin } from '@mixins/companyMixin';

export default {
  metaInfo: { title: 'Répertoire structures' },
  name: 'CompaniesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'ni-option-group': OptionGroup,
    'ni-input': Input,
    'ni-modal': Modal,
  },
  mixins: [companyMixin],
  data () {
    return {
      companies: [],
      tableLoading: false,
      visibleColumns: ['name'],
      columns: [{ name: 'tradeName', label: 'Nom', align: 'left', field: 'tradeName', sortable: true }],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
      companyTypeOptions: COMPANY_TYPES,
      companyCreationModal: false,
      newCompany: {
        name: '',
        tradeName: '',
        type: '',
      },
      modalLoading: false,
    }
  },
  validations () {
    return {
      newCompany: pick(this.companyValidation, ['type', 'name', 'tradeName']),
    }
  },
  async mounted () {
    await this.refreshCompanies();
  },
  computed: {
    filteredCompanies () {
      return this.companies.filter(company => company.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToCompanyProfile (row) {
      this.$router.push({ name: 'profile company info', params: { companyId: row._id } });
    },
    async refreshCompanies () {
      try {
        this.tableLoading = true;
        this.companies = await Companies.list();
      } catch (e) {
        console.error(e);
        this.companies = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.newCompany = { name: '', tradeName: '', type: '' };
      this.$v.newCompany.$reset();
    },
    async createCompany () {
      try {
        this.modalLoading = true;
        await Companies.create({ ...this.newCompany });

        this.companyCreationModal = false;
        NotifyPositive('Structure créée.')
        await this.refreshCompanies();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Structure déjà existante.');
        NotifyNegative('Erreur lors de la création de la structure.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
