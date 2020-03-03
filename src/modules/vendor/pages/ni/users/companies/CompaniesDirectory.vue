<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCompanies" :columns="columns" :loading="tableLoading" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="companyCreationModal = true" />

    <!-- User creation modal -->
    <ni-modal v-model="companyCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">structure</span>
      </template>
      <ni-input in-modal v-model.trim="newCompany.name" :error="$v.newCompany.name.$error"
        @blur="$v.newCompany.name.$touch" required-field caption="Raison sociale" />
      <ni-input in-modal v-model.trim="newCompany.tradeName" :error="$v.newCompany.tradeName.$error"
        caption="Nom commercial" @blur="$v.newCompany.tradeName.$touch" required-field />
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
import { required } from 'vuelidate/lib/validators';
import pickBy from 'lodash/pickBy';
import cloneDeep from 'lodash/cloneDeep';
import Companies from '@api/Companies';
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { COMPANY, ASSOCIATION } from '@data/constants';

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
  data () {
    return {
      companies: [],
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
      ],
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      searchStr: '',
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
      newCompany: {
        name: { required },
        tradeName: { required },
        type: { required },
      },
    }
  },
  async mounted () {
    await this.refreshCompanies();
  },
  computed: {
    filteredCompanies () {
      return this.companies.filter(company => company.name.match(new RegExp(this.searchStr, 'i')));
    },
    companyTypeOptions () {
      return [{ label: 'Association', value: ASSOCIATION }, { label: 'Entreprise', value: COMPANY }]
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshCompanies () {
      try {
        this.companies = await Companies.list();
      } catch (e) {
        console.error(e);
        this.companies = [];
        NotifyNegative('Erreur lors de la récupération des structures');
      }
    },
    resetCreationModal () {
      this.newCompany = { name: '', tradeName: '', type: '' };
      this.$v.newCompany.$reset();
    },
    async createCompany () {
      try {
        this.modalLoading = true;
        const payload = pickBy(cloneDeep(this.newCompany));
        await Companies.create(payload);

        this.companyCreationModal = false;
        NotifyPositive('Structure crée.')
        await this.refreshCompanies();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la structure.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
