<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCompanies" :columns="columns" :loading="tableLoading"
      v-model:pagination="pagination" :path="path" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="companyCreationModal = true" :disable="tableLoading" />

    <company-creation-modal v-model="companyCreationModal" v-model:new-company="newCompany" :validations="v$.newCompany"
      :loading="modalLoading" @hide="resetCreationModal" @submit="createCompany" />
  </q-page>
</template>

<script>
import { computed, ref } from 'vue';
import { useMeta } from 'quasar';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import escapeRegExp from 'lodash/escapeRegExp';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import CompanyCreationModal from 'src/modules/vendor/components/companies/CompanyCreationModal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { removeDiacritics, sortStrings } from '@helpers/utils';
import { DIRECTORY } from '@data/constants';

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

    const visibleColumns = ['name'];
    const columns = [
      {
        name: 'name',
        label: 'Nom',
        align: 'left',
        field: 'name',
        sortable: true,
        sort: sortStrings,
      },
      {
        name: 'holding',
        label: 'Société mère',
        align: 'center',
        style: 'width: 20%',
        field: 'holding',
        format: value => get(value, 'name') || '',
        sortable: true,
        sort: (a, b) => sortStrings(a.name, b.name),
      },
    ];
    const path = { name: 'ni users companies info', params: 'companyId' };
    const companies = ref([]);
    const tableLoading = ref(false);
    const pagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });
    const searchStr = ref('');
    const companyCreationModal = ref(false);
    const newCompany = ref({ name: '', salesRepresentative: '', holding: '' });
    const modalLoading = ref(false);

    const rules = computed(() => ({ newCompany: { name: { required } } }));
    const v$ = useVuelidate(rules, { newCompany });

    const filteredCompanies = computed(() => {
      const formattedString = escapeRegExp(removeDiacritics(searchStr.value));
      return companies.value.filter(company => company.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    });

    const updateSearch = (value) => { searchStr.value = value; };

    const refreshCompanies = async () => {
      try {
        tableLoading.value = true;
        const companyList = await Companies.list({ action: DIRECTORY });

        companies.value = companyList.map(c => ({ ...c, noDiacriticsName: removeDiacritics(c.name) }));
      } catch (e) {
        console.error(e);
        companies.value = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      } finally {
        tableLoading.value = false;
      }
    };

    const resetCreationModal = () => {
      newCompany.value = { name: '', salesRepresentative: '', holding: '' };
      v$.value.newCompany.$reset();
    };

    const createCompany = async () => {
      try {
        v$.value.newCompany.$touch();
        if (v$.value.newCompany.$error) return NotifyWarning('Champ(s) invalide(s)');
        modalLoading.value = true;

        await Companies.create(pickBy(newCompany.value));

        companyCreationModal.value = false;
        NotifyPositive('Structure créée.');
        await refreshCompanies();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative('Structure déjà existante.');
        NotifyNegative('Erreur lors de la création de la structure.');
      } finally {
        modalLoading.value = false;
      }
    };

    const created = async () => {
      await refreshCompanies();
    };

    created();

    return {
      // Data
      companies,
      tableLoading,
      visibleColumns,
      columns,
      pagination,
      searchStr,
      companyCreationModal,
      newCompany,
      modalLoading,
      path,
      // Validations
      v$,
      // Computed
      filteredCompanies,
      // Methods
      updateSearch,
      refreshCompanies,
      resetCreationModal,
      createCompany,
    };
  },
};
</script>
