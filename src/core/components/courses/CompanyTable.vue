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
import { onMounted, computed, ref, toRefs } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useStore } from 'vuex';
import get from 'lodash/get';
import Companies from '@api/Companies';
import Courses from '@api/Courses';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';

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
    const companyAdditionModal = ref(false);
    const companyModalLoading = ref(false);
    const companyOptions = ref([]);
    const selectedCompany = ref('');

    const companiesCount = computed(() => companies.value.length);

    const course = computed(() => $store.state.course.course);

    const rules = { selectedCompany: { required } };

    const companyValidation = useVuelidate(rules, { selectedCompany });

    const getPotentialCompanies = async () => {
      try {
        const potentialCompanies = Object.freeze(await Companies.list());
        companyOptions.value = potentialCompanies
          .map(company => ({ value: company._id, label: company.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (error) {
        companyOptions.value = [];
        console.error(error);
      }
    };

    const resetCompanyAdditionModal = () => {
      selectedCompany.value = '';
      companyValidation.value.selectedCompany.$reset();
    };
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
    const openCompanyAdditionModal = () => {
      if (course.value.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de structure à une formation archivée.');
      }

      companyAdditionModal.value = true;
    };

    onMounted(async () => {
      await getPotentialCompanies();
    });

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
