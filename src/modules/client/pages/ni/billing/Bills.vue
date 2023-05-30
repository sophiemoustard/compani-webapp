<template>
  <q-page class="client-background">
    <ni-title-header title="Factures" padding>
      <template #content>
          <div class="row">
            <ni-date-range v-model="billingDates" @blur="getBills" :error-message="billingDatesError"
              :error="v$.billingDates.$error" />
          </div>
      </template>
    </ni-title-header>
    <ni-simple-table :columns="columns" v-model:pagination="pagination" :data="bills" :loading="tableLoading"
      :rows-per-page-options="rowsPerPageOptions">
     <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'number'">
              <div class="cursor-pointer clickable-name" @click.stop="downloadBill(props.row)" :disable="pdfLoading">
                  {{ props.row.number }}
              </div>
            </template>
            <template v-else-if="col.name === 'customer'">
              <div class="cursor-pointer customer" @click.stop="goToCustomerInfos(props.row.customer._id)">
                  {{ formatIdentity(props.row.customer.identity, 'Lf') }}
              </div>
            </template>
            <template v-else-if="col.name === 'netInclTaxes'">{{ formatPrice(props.row.netInclTaxes) }}</template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
  </q-page>
</template>
<script>
import { useMeta } from 'quasar';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Bills from '@api/Bills';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { formatIdentity, formatPrice, formatDownloadName, truncate, sortStrings } from '@helpers/utils';
import { formatDate, isBefore } from '@helpers/date';
import { downloadFile } from '@helpers/file';
import TitleHeader from '@components/TitleHeader';
import DateRange from '@components/form/DateRange';
import { NotifyNegative, NotifyWarning } from '@components/popup/notify';
import SimpleTable from '@components/table/SimpleTable';
import { AUTOMATIC } from '@data/constants';

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
    const bills = ref([]);
    const columns = ref([
      { name: 'number', label: '#', align: 'left', field: 'number', sortable: true },
      { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate, sortable: true },
      {
        name: 'customer',
        label: 'Bénéficiaire',
        align: 'left',
        field: row => formatIdentity(row.customer.identity, 'Lf'),
        sortable: true,
        sort: sortStrings,
      },
      {
        name: 'client',
        label: 'Client',
        align: 'left',
        sortable: true,
        field: row => getClientName(row),
        sort: sortStrings,
      },
      {
        name: 'netInclTaxes',
        label: 'Total TTC',
        align: 'left',
        style: 'width: 15%',
        sortable: true,
        field: 'netInclTaxes',
      },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'date', descending: true });
    const rowsPerPage = ref([1, 5, 15, 50, 100, 200, 300]);
    const tableLoading = ref(false);
    const pdfLoading = ref(false);

    const getBills = async () => {
      try {
        v$.value.billingDates.$touch();
        if (v$.value.billingDates.$error) return NotifyWarning('Date(s) invalide(s)');

        tableLoading.value = true;

        bills.value = Object.freeze(await Bills.list({
          type: AUTOMATIC,
          startDate: billingDates.value.startDate,
          endDate: billingDates.value.endDate,
        }));
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        tableLoading.value = false;
      }
    };

    const getClientName = (bill) => {
      if (!bill.thirdPartyPayer) return formatIdentity(bill.customer.identity, 'Lf');
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
      $router.push({ name: 'ni customers info', params: { customerId }, query: { defaultTab: 'billing' } });
    };

    const max = computed(() => moment(billingDates.value.startDate).add(1, 'year').subtract(1, 'day').toISOString());
    const min = computed(() => moment(billingDates.value.endDate).subtract(1, 'year').toISOString());

    const rules = computed(() => ({
      billingDates: {
        startDate: { required, minDate: minDate(min.value) },
        endDate: { required, minDate: minDate(billingDates.value.startDate), maxDate: maxDate(max.value) },
      },
    }));
    const v$ = useVuelidate(rules, { billingDates });

    const billingDatesError = computed(() => {
      if (isBefore(billingDates.value.endDate, billingDates.value.startDate)) {
        return 'La date de fin doit être postérieure à la date de début';
      }

      const requiredField = v$.value.billingDates.startDate.required.$response === false ||
        v$.value.billingDates.endDate.required.$response === false;
      if (requiredField) return 'Champ requis';

      return 'Date(s) invalide(s) : la période maximale est 1 an';
    });

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
<style lang="sass" scoped>
.customer:hover
  text-decoration: underline
</style>
