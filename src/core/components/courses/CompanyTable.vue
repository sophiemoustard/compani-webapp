<template>
  <div class="q-mb-xl">
    <div class="row">
      <p class="text-weight-bold table-title">Structures ({{ companiesCount }})</p>
    </div>
    <q-card>
      <ni-responsive-table :data="companies" :columns="columns" v-model:pagination="pagination"
        no-data-label="Aucune structure n’est rattachée à la formation" :hide-bottom="!!companies.length">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right" v-if="canEdit">
        <ni-button color="primary" icon="add" label="Ajouter une structure" :disable="loading"
          @click="openCompanyAdditionModal" />
      </q-card-actions>
    </q-card>

    <company-addition-modal v-model="companyAdditionModal" v-model:selected-company="selectedCompany"
      @submit="addCompany" :validations="companyValidation.selectedCompany" :loading="companyModalLoading"
      @hide="resetCompanyAdditionModal" :company-options="companyOptions" />
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { useCompanies } from '@composables/companies';

export default {
  name: 'CompanyTable',
  props: {
    canEdit: { type: Boolean, default: false },
    companies: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
    'company-addition-modal': CompanyAdditionModal,
    'ni-button': Button,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const { companies } = toRefs(props);

    const $store = useStore();

    const columns = ref([
      {
        name: 'name',
        label: 'Nom',
        align: 'left',
        field: row => get(row, 'name'),
        classes: 'text-capitalize',
      },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'name' });

    const course = computed(() => $store.state.course.course);

    const {
      selectedCompany,
      companyAdditionModal,
      companyModalLoading,
      companyValidation,
      resetCompanyAdditionModal,
      companiesCount,
      getPotentialCompanies,
      companyOptions,
      openCompanyAdditionModal,
    } = useCompanies(companies, course);

    const addCompany = async () => {
      try {
        companyModalLoading.value = true;
        companyValidation.value.selectedCompany.$touch();
        if (companyValidation.value.selectedCompany.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.addCompany(course.value._id, { company: selectedCompany.value });
        companyAdditionModal.value = false;
        emit('refresh');
        NotifyPositive('Structure ajoutée.');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        if (e.status === 403) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de la structure.');
      } finally {
        companyModalLoading.value = false;
      }
    };

    const created = async () => { await getPotentialCompanies(); };

    created();

    return {
      // Data
      columns,
      pagination,
      companyAdditionModal,
      selectedCompany,
      companyModalLoading,
      companyOptions,
      // Computed
      companiesCount,
      companyValidation,
      // Methods
      get,
      openCompanyAdditionModal,
      addCompany,
      resetCompanyAdditionModal,
    };
  },
};
</script>
