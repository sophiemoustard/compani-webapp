<template>
  <q-page class="vendor-background q-pb-xl">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Suivi des factures</p>
      <ni-expanding-table :data="courseBills" :columns="columns" v-model:pagination="pagination" :hide-bottom="false"
        :loading="loading">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'number'">
              <div class="cliquable-name" @click="downloadBill(props.row._id)" :disable="pdfLoading">
                {{ col.value }}
              </div>
              <div class="flex">
                <div class="program ellipsis">{{ `${get(props.row, 'course.subProgram.program.name')}` }}</div>
                <div v-if="get(props.row, 'course.misc')" class="misc">- {{ get(props.row, 'course.misc') }}</div>
              </div>
            </template>
            <template v-else-if="col.name === 'progress' && col.value >= 0">
              <ni-progress class="q-ml-lg" :value="col.value" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </template>
      </ni-expanding-table>
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { ref } from 'vue';
import CourseBills from '@api/CourseBills';
import { formatPrice, readAPIResponseWithTypeArrayBuffer } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import { formatDate } from '@helpers/date';
import { BALANCE } from '@data/constants.js';
import { NotifyNegative } from '@components/popup/notify';
import ExpandingTable from '@components/table/ExpandingTable';
import Progress from '@components/CourseProgress';

export default {
  name: 'ProfileBilling',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-expanding-table': ExpandingTable,
    'ni-progress': Progress,
  },
  setup (props) {
    const companyId = ref(props.profileId);
    const courseBills = ref([]);
    const loading = ref(false);
    const pdfLoading = ref(false);
    const columns = ref([
      {
        name: 'date',
        label: 'Date',
        field: 'billedAt',
        format: value => formatDate(value),
        align: 'left',
      },
      { name: 'number', label: '#', field: 'number', align: 'left', style: 'max-width: 250px' },
      {
        name: 'progress',
        label: 'Avancement formation',
        field: 'progress',
        align: 'center',
        style: 'min-width: 150px; width: 20%',
      },
      {
        name: 'netInclTaxes',
        label: 'Montant',
        field: 'netInclTaxes',
        format: value => formatPrice(value),
        align: 'center',
      },
      { name: 'expand', label: '', field: '' },
    ]);
    const pagination = ref({ sortBy: 'date', ascending: true, page: 1, rowsPerPage: 15 });

    const refreshCourseBills = async () => {
      try {
        loading.value = true;
        courseBills.value = await CourseBills.list({ company: companyId.value, action: BALANCE });
      } catch (e) {
        console.error(e);
        courseBills.value = [];
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        loading.value = false;
      }
    };

    const downloadBill = async (billId) => {
      try {
        pdfLoading.value = true;
        const pdf = await CourseBills.getPdf(billId);
        downloadFile(pdf, 'facture.pdf', 'application/octet-stream');
      } catch (e) {
        console.error(e);
        if (e.status === 404) {
          const { message } = readAPIResponseWithTypeArrayBuffer(e);
          return NotifyNegative(message);
        }
        NotifyNegative('Erreur lors du téléchargement de la facture.');
      } finally {
        pdfLoading.value = false;
      }
    };
    const created = async () => {
      refreshCourseBills();
    };

    created();

    return {
      // Data
      companyId,
      courseBills,
      columns,
      pagination,
      loading,
      pdfLoading,
      // Methods
      refreshCourseBills,
      formatPrice,
      downloadBill,
      get,
    };
  },
};
</script>

<style lang="sass" scoped>
.cliquable-name
  text-decoration: underline
  color: $primary
  width: fit-content
.program
  max-width: fit-content
  flex: 1
  color: $copper-grey-600
.misc
  width: max-content
  padding-left: 4px
  color: $copper-grey-600
</style>
