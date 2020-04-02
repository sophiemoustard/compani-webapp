<template>
  <q-page padding class="neutral-background q-pb-xl">
    <h4>Historique</h4>
    <div class="row q-col-gutter-sm">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" in-form />
      <ni-date-range class="col-md-6 col-xs-12" caption="Période" v-model="dateRange" :error="$v.dateRange.$error"
        @input="input" :error-label="dateRangeErrorLabel" @blur="$v.dateRange.$touch" />
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" :disable="loading || $v.dateRange.$error" :loading="loading" />
  </q-page>
</template>

<script>
import Exports from '@api/Exports';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { downloadFile } from '@helpers/file';
import Select from '@components/form/Select';
import DateRange from '@components/form/DateRange';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';
import { EXPORT_HISTORY_TYPES, WORKING_EVENT } from '@data/constants';

export default {
  name: 'History',
  metaInfo: { title: 'Historique' },
  components: {
    'ni-select': Select,
    'ni-date-range': DateRange,
  },
  data () {
    return {
      exportTypeOptions: EXPORT_HISTORY_TYPES,
      type: WORKING_EVENT,
      dateRange: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      min: this.$moment().endOf('M').subtract(1, 'year').toISOString(),
      max: this.$moment().startOf('M').add(1, 'year').toISOString(),
      loading: false,
    }
  },
  validations () {
    return {
      dateRange: {
        startDate: { minDate: minDate(this.min) },
        endDate: { maxDate: maxDate(this.max) },
      },
    };
  },
  computed: {
    dateRangeErrorLabel () {
      return 'Date(s) invalide(s) : la période maximale est 1 an.';
    },
  },
  methods: {
    input (date) {
      this.min = this.$moment(date.endDate).subtract(1, 'year').add(1, 'day').toISOString();
      this.max = this.$moment(date.startDate).add(1, 'year').subtract(1, 'day').toISOString();
    },
    async exportCsv () {
      try {
        this.loading = true;
        await this.$v.dateRange.$touch();
        if (this.$v.dateRange.$error) return NotifyWarning('Date(s) invalide(s)')
        const type = EXPORT_HISTORY_TYPES.find(type => type.value === this.type);
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
}
</script>

<style lang="stylus" scoped>
.export-form
  display: flex
  justify-content: space-between
  div
    width: auto
</style>
