<template>
  <q-page padding class="client-background q-pb-xl">
    <ni-title-header title="Historique" class="q-mb-xl" />
    <div class="row q-col-gutter-sm">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" />
      <ni-date-range class="col-md-6 col-xs-12" caption="Période" v-model="dateRange" :error="v$.dateRange.$error"
        @update:model-value="input" :error-message="dateRangeErrorMessage" @blur="v$.dateRange.$touch" />
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" :disable="loading || v$.dateRange.$error" :loading="loading" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import Exports from '@api/Exports';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import DateRange from '@components/form/DateRange';
import { VENDOR_EXPORT_HISTORY_TYPES, COURSE } from '@data/constants';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';

export default {
  name: 'History',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-date-range': DateRange,
  },
  setup () {
    const metaInfo = { title: 'Historique' };
    useMeta(metaInfo);

    const exportTypeOptions = VENDOR_EXPORT_HISTORY_TYPES;
    const type = ref(COURSE);
    const dateRange = ref({
      startDate: moment().startOf('M').toISOString(),
      endDate: moment().endOf('M').toISOString(),
    });
    const min = ref(moment().endOf('M').subtract(1, 'year').toISOString());
    const max = ref(moment().startOf('M').add(1, 'year').toISOString());
    const loading = ref(false);

    const rules = computed(() => ({
      dateRange: {
        startDate: { minDate: minDate(min.value) },
        endDate: { maxDate: maxDate(max.value) },
      },
    }));

    const v$ = useVuelidate(rules, { dateRange });

    const dateRangeErrorMessage = computed(() => 'Date(s) invalide(s) : la période maximale est 1 an.');

    const input = (date) => {
      min.value = moment(date.endDate).subtract(1, 'year').add(1, 'day').toISOString();
      max.value = moment(date.startDate).add(1, 'year').subtract(1, 'day').toISOString();
    };
    const exportCsv = async () => {
      try {
        loading.value = true;
        await v$.value.dateRange.$touch();
        if (v$.value.dateRange.$error) return NotifyWarning('Date(s) invalide(s)');
        const exportType = VENDOR_EXPORT_HISTORY_TYPES.find(t => t.value === type.value);
        if (!exportType) return NotifyNegative('Impossible de téléchager le document.');
        const csv = await Exports.getHistoryCsv({ ...dateRange.value, type: exportType.value });
        await downloadFile(csv, `${exportType.label}.csv`);

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document.');
      } finally {
        loading.value = false;
      }
    };

    return {
      // Data
      exportTypeOptions,
      type,
      dateRange,
      min,
      max,
      loading,
      // Validations
      v$,
      // Computed
      dateRangeErrorMessage,
      // Methods
      input,
      exportCsv,
    };
  },
};
</script>
