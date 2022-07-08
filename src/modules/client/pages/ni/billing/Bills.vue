<template>
  <q-page class="client-background">
    <ni-title-header title="Factures" padding>
      <template #content>
          <div class="row">
            <ni-date-range v-model="billingDates" @blur="getBills" :error-message="billingDatesError"
              borderless />
          </div>
      </template>
    </ni-title-header>
    <ni-simple-table :columns="columns" v-model:pagination="pagination" :data="bills" :loading="tableLoading"
      :rows-per-page="rowsPerPage">
     <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'number'">
              <div class="cursor-pointer clickable-name" @click.stop="downloadBill(props.row)" :disable="pdfLoading">
                  {{ props.row.number }}
              </div>
            </template>
            <template v-if="col.name === 'customer'">
              <div class="cursor-pointer clickable-name" @click.stop="goToCustomerInfos(props.row.customer._id)">
                  {{ formatIdentity(props.row.customer.identity, 'Lf') }}
              </div>
            </template>
            <template v-if="col.name === 'client'">{{ getClientName(props.row.customer, props.row) }}</template>
            <template v-if="col.name === 'netInclTaxes'">{{ formatPrice(props.row.netInclTaxes) }}</template>
            <template v-else-if="col.name === 'date'">{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
  </q-page>
</template>
<script>
import { useMeta } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Bills from '@api/Bills';
import { minDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { formatIdentity, formatPrice, formatDownloadName, truncate } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { downloadFile } from '@helpers/file';
import TitleHeader from '@components/TitleHeader';
import DateRange from '@components/form/DateRange';
import { NotifyNegative, NotifyWarning } from '@components/popup/notify';
import SimpleTable from '@components/table/SimpleTable';
import { AUTOMATIC, REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'Bills',
  components: {
    'ni-title-header': TitleHeader,
    'ni-date-range': DateRange,
    'ni-simple-table': SimpleTable,
  },
  setup () {
    const metaInfo = { title: 'Factures' };
    useMeta(metaInfo);
    const $router = useRouter();

    const billingDates = ref({
      startDate: moment().subtract(1, 'month').startOf('month').toISOString(),
      endDate: moment().subtract(1, 'month').endOf('month').toISOString(),
    });
    const billingDatesError = ref('');
    const bills = ref([]);
    const columns = ref([
      { name: 'number', label: '#', align: 'left', field: 'number' },
      { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
      {
        name: 'customer',
        label: 'Bénéficiaire',
        align: 'left',
        field: row => formatIdentity(row.customer.identity, 'Lf'),
      },
      { name: 'client', label: 'Client', align: 'left' },
      { name: 'netInclTaxes', label: 'Total TTC', align: 'left', style: 'width: 15%' },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'date', descending: true });
    const rowsPerPage = ref([1, 5, 15, 50, 100, 200, 300]);
    const tableLoading = ref(false);
    const pdfLoading = ref(false);

    const getBills = async () => {
      try {
        v$.value.billingDates.$touch();

        if (v$.value.billingDates.endDate.minDate.$response === false) {
          const error = 'La date de fin ne peut pas être antérieure à la date de début.';
          billingDatesError.value = error;
          return NotifyWarning(error);
        }

        const requiredError = v$.value.billingDates.startDate.required.$response === false ||
          v$.value.billingDates.endDate.required.$response === false;
        if (requiredError) {
          const error = REQUIRED_LABEL;
          billingDatesError.value = error;
          return NotifyWarning(error);
        }

        tableLoading.value = true;

        bills.value = Object.freeze(await Bills.list({
          type: AUTOMATIC,
          startDate: billingDates.value.startDate,
          endDate: billingDates.value.endDate,
        }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        tableLoading.value = false;
      }
    };

    const getClientName = (customer, bill) => {
      if (!bill.thirdPartyPayer) return formatIdentity(customer.identity, 'Lf');
      return truncate(bill.thirdPartyPayer.name, 50);
    };

    const downloadBill = async (bill) => {
      try {
        pdfLoading.value = true;
        const pdf = await Bills.getPdf(bill._id);
        const customerName = `${bill.customer.identity.firstname}_${bill.customer.identity.lastname}`;
        const pdfName = `${formatDownloadName(`${customerName}_${bill.number}`)}.pdf`;

        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la facture.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const goToCustomerInfos = (customerId) => {
      $router.push({ name: 'ni customers info', params: { customerId, defaultTab: 'billing' } });
    };

    const rules = {
      billingDates: { startDate: { required }, endDate: { required, minDate: minDate(billingDates.value.startDate) } },
    };
    const v$ = useVuelidate(rules, { billingDates });

    const created = async () => getBills();
    created();

    return {
      // DATA
      billingDates,
      billingDatesError,
      bills,
      columns,
      pagination,
      rowsPerPage,
      tableLoading,
      pdfLoading,
      // Methods
      getBills,
      getClientName,
      formatIdentity,
      formatPrice,
      formatDate,
      downloadBill,
      goToCustomerInfos,
      // Validations
      v$,
    };
  },
};
</script>
