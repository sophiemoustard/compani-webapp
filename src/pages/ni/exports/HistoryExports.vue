<template>
  <q-page padding class="neutral-background q-pb-xl">
    <h4>Historique</h4>
    <div class="row q-col-gutter-sm">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" in-form />
      <ni-date-range class="col-md-6 col-xs-12" caption="Période" v-model="dateRange" :min="min" :max="max"
        :error.sync="dateRangeHasError || $v.dateRange.$error" @input="input" error-label="Date(s) Invalide(s)"/>
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" :disable="dateRangeHasError || loading" :loading="loading" />
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import { downloadFile } from '../../../helpers/downloadFile';
import Select from '../../../components/form/Select';
import DateRange from '../../../components/form/DateRange';
import { EXPORT_HISTORY_TYPES, WORKING_EVENT } from '../../../data/constants';
import { minDate, maxDate } from '../../../helpers/vuelidateCustomVal';

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
      dateRange: { startDate: this.$moment().startOf('M').toISOString(), endDate: this.$moment().endOf('M').toISOString() },
      dateRangeHasError: false,
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
        if (!type) return NotifyNegative('Impossible de téléchager le document');

        const csv = await this.$exports.getHistoryCsv({ ...this.dateRange, type: type.value });
        await downloadFile(csv, `${type.label}.csv`);

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document');
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
