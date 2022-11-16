<template>
  <div class="q-mb-xl">
    <div class="row">
      <p class="text-weight-bold table-title">Structures ({{ companiesCount }})</p>
    </div>
    <q-card>
      <ni-responsive-table :data="course.companies" :columns="columns" v-model:pagination="pagination"
        no-data-label="Aucune structure n’est rattachée à la formation" :hide-bottom="!!companiesCount">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <ni-button icon="close" @click="validateCompanyDeletion(col.value)" :disable="!!course.archivedAt" />
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right" v-if="canEdit">
        <ni-button color="primary" icon="add" label="Rattacher une structure" :disable="loading"
          @click="openCompanyAdditionModal" />
      </q-card-actions>
    </q-card>

    <company-addition-modal v-model="companyAdditionModal" v-model:selected-company="selectedCompany"
      @submit="addCompany" :validations="companyValidation.selectedCompany" :loading="companyModalLoading"
      @hide="resetCompanyAdditionModal" :company-options="companyOptions" />
  </div>
</template>

<script>
import { ref, toRefs } from 'vue';
import get from 'lodash/get';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { useCompaniesCoursesLink } from '@composables/companiesCoursesLink';

export default {
  name: 'CompanyTable',
  props: {
    canEdit: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
    'company-addition-modal': CompanyAdditionModal,
    'ni-button': Button,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const { course } = toRefs(props);

    const columns = ref([
      {
        name: 'name',
        label: 'Nom',
        align: 'left',
        field: row => get(row, 'name'),
        classes: 'text-capitalize',
      },
      { name: 'actions', label: '', align: 'right', field: '_id' },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'name' });

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
      addCompany,
      validateCompanyDeletion,
    } = useCompaniesCoursesLink(course, emit);

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
      validateCompanyDeletion,
    };
  },
};
</script>
