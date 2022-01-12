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
import useVuelidate from '@vuelidate/core';
import Exports from '@api/Exports';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import DateRange from '@components/form/DateRange';
import { EXPORT_HISTORY_TYPES, WORKING_EVENT } from '@data/constants';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';
import { isBefore } from '@helpers/date';

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

    return { v$: useVuelidate() };
  },
  data () {
    return {
      exportTypeOptions: EXPORT_HISTORY_TYPES,
      type: WORKING_EVENT,
      dateRange: {
        startDate: moment().startOf('M').toISOString(),
        endDate: moment().endOf('M').toISOString(),
      },
      min: moment().endOf('M').subtract(1, 'year').toISOString(),
      max: moment().startOf('M').add(1, 'year').toISOString(),
      loading: false,
    };
  },
  validations () {
    return {
      dateRange: {
        startDate: { minDate: minDate(this.min) },
        endDate: { maxDate: maxDate(this.max), minDate: minDate(this.dateRange.startDate) },
      },
    };
  },
  computed: {
    dateRangeErrorMessage () {
      if (isBefore(this.dateRange.endDate, this.dateRange.startDate)) {
        return 'La date de fin doit être postérieure à la date de début';
      }

      return 'Date(s) invalide(s) : la période maximale est 1 an';
    },
  },
  methods: {
    input (date) {
      this.min = moment(date.endDate).subtract(1, 'year').add(1, 'day').toISOString();
      this.max = moment(date.startDate).add(1, 'year').subtract(1, 'day').toISOString();
    },
    async exportCsv () {
      try {
        this.loading = true;
        await this.v$.dateRange.$touch();
        if (this.v$.dateRange.$error) return NotifyWarning('Date(s) invalide(s)');
        const type = EXPORT_HISTORY_TYPES.find(t => t.value === this.type);
        if (!type) return NotifyNegative('Impossible de téléchager le document.');

        const csv = await Exports.getHistoryCsv({ ...this.dateRange, type: type.value });
        await downloadFile(csv, `${type.label}.csv`);

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document.');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
