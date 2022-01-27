<template>
  <q-page padding class="vendor-background q-pb-xl">
    <ni-title-header title="Configuration de la facturation" class="q-mb-xl" />
    <p class="text-weight-bold">Financeurs</p>
    <q-card>
      <ni-responsive-table :data="courseFundingOrganisations" :columns="courseFundingOrganisationColumns"
        v-model:pagination="pagination" class="q-mb-md" :loading="tableLoading" />
    </q-card>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref } from 'vue';
import { NotifyNegative } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import ResponsiveTable from '@components/table/ResponsiveTable';
import get from 'lodash/get';

export default {
  name: 'BillingConfig',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
  },
  setup () {
    const metaInfo = { title: 'BillingConfig' };
    useMeta(metaInfo);

    const tableLoading = ref(false);
    const courseFundingOrganisations = ref([]);
    const courseFundingOrganisationColumns = [
      { name: 'type', label: 'Nom', align: 'left', field: 'name' },
      { name: 'address', label: 'Adresse', align: 'left', field: row => get(row, 'address.fullAddress') || '' },
    ];
    const pagination = { rowsPerPage: 0 };

    const refreshCourseFundingOrganisations = async () => {
      try {
        tableLoading.value = true;
        courseFundingOrganisations.value = await CourseFundingOrganisations.list();
      } catch (e) {
        console.error(e);
        courseFundingOrganisations.value = [];
        NotifyNegative('Erreur lors de la récupération des financeurs.');
      } finally {
        tableLoading.value = false;
      }
    };

    const created = async () => {
      refreshCourseFundingOrganisations();
    };

    created();

    return {
      // Data
      courseFundingOrganisationColumns,
      tableLoading,
      pagination,
      courseFundingOrganisations,
      // Methods
      refreshCourseFundingOrganisations,
    };
  },
};
</script>
