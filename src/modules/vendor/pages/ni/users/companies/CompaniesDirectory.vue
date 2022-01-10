<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCompanies" :columns="columns" :loading="tableLoading"
      v-model:pagination="pagination" @go-to="goToCompanyProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="companyCreationModal = true" :disable="tableLoading" />

    <company-creation-modal v-model="companyCreationModal" v-model:new-company="newCompany" :validations="v$.newCompany"
      :loading="modalLoading" :company-type-options="companyTypeOptions" @hide="resetCreationModal"
      @submit="createCompany" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import pick from 'lodash/pick';
import Companies from '@api/Companies';
import escapeRegExp from 'lodash/escapeRegExp';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import CompanyCreationModal from 'src/modules/vendor/components/companies/CompanyCreationModal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { COMPANY_TYPES } from '@data/constants';
import { removeDiacritics } from '@helpers/utils';
import { companyMixin } from '@mixins/companyMixin';

export default {
  name: 'CompaniesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'company-creation-modal': CompanyCreationModal,
  },
  setup () {
    const metaInfo = { title: 'Répertoire structures' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  mixins: [companyMixin],
  data () {
    return {
      companies: [],
      tableLoading: false,
      visibleColumns: ['name'],
      columns: [{ name: 'name', label: 'Nom', align: 'left', field: 'name', sortable: true }],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
      companyTypeOptions: COMPANY_TYPES,
      companyCreationModal: false,
      newCompany: { name: '', type: '' },
      modalLoading: false,
    };
  },
  validations () {
    return {
      newCompany: pick(this.companyValidation, ['type', 'name']),
    };
  },
  async created () {
    await this.refreshCompanies();
  },
  computed: {
    filteredCompanies () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.companies.filter(company => company.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToCompanyProfile (row) {
      this.$router.push({ name: 'ni users companies info', params: { companyId: row._id } });
    },
    async refreshCompanies () {
      try {
        this.tableLoading = true;
        const companyList = await Companies.list();

        this.companies = companyList.map(c => ({ ...c, noDiacriticsName: removeDiacritics(c.name) }));
      } catch (e) {
        console.error(e);
        this.companies = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.newCompany = { name: '', type: '' };
      this.v$.newCompany.$reset();
    },
    async createCompany () {
      try {
        this.v$.newCompany.$touch();
        if (this.v$.newCompany.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.modalLoading = true;
        await Companies.create({ ...this.newCompany });

        this.companyCreationModal = false;
        NotifyPositive('Structure créée.');
        await this.refreshCompanies();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative('Structure déjà existante.');
        NotifyNegative('Erreur lors de la création de la structure.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
