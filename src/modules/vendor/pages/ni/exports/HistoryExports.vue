<template>
  <q-page padding class="vendor-background q-pb-xl">
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
import CompaniDate from '@helpers/dates/companiDates';

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
      startDate: CompaniDate().startOf('month').toISO(),
      endDate: CompaniDate().endOf('month').toISO(),
    });
    const min = ref(CompaniDate().endOf('month').subtract('P1Y').toISO());
    const max = ref(CompaniDate().startOf('month').add('P1Y').toISO());
    const loading = ref(false);

    const rules = computed(() => ({
      dateRange: {
        startDate: { minDate: minDate(min.value) },
        endDate: { maxDate: maxDate(max.value), minDate: minDate(dateRange.value.startDate) },
      },
    }));

    const v$ = useVuelidate(rules, { dateRange });

    const dateRangeErrorMessage = computed(() => {
      if (CompaniDate(dateRange.value.endDate).isBefore(dateRange.value.startDate)) {
        return 'La date de fin doit être postérieure à la date de début';
      }

      return 'Date(s) invalide(s) : la période maximale est 1 an';
    });

    const input = (date) => {
      min.value = CompaniDate(date.endDate).subtract('P1Y').add('P1D').toISO();
      max.value = CompaniDate(date.startDate).add('P1Y').subtract('P1D').toISO();
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
