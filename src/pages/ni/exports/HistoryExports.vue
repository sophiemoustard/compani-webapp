<template>
  <q-page padding class="neutral-background q-pb-xl">
    <h4>Historique</h4>
    <div class="row q-col-gutter-sm">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" in-form />
      <ni-date-range class="col-md-6 col-xs-12" caption="Période" v-model="dateRange" :error.sync="dateRangeHasError" />
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" :disable="dateRangeHasError" />
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../../components/popup/notify';
import { downloadFile } from '../../../helpers/downloadFile';
import Select from '../../../components/form/Select';
import DateRange from '../../../components/form/DateRange';
import { EXPORT_HISTORY_TYPES, WORKING_EVENT } from '../../../data/constants';

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
    }
  },
  methods: {
    async exportCsv () {
      try {
        const type = EXPORT_HISTORY_TYPES.find(type => type.value === this.type);
        if (!type) return NotifyNegative('Impossible de téléchager le document');

        const csv = await this.$exports.getHistoryCsv({ ...this.dateRange, type: type.value });
        await downloadFile(csv, `${type.label}.csv`);

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document');
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
