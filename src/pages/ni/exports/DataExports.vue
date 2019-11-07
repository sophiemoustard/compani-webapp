<template>
  <q-page padding class="neutral-background q-pb-xl">
    <h4>Données</h4>
    <div class="row">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" in-form />
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" />
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../../components/popup/notify';
import { downloadFile } from '../../../helpers/downloadFile';
import Select from '../../../components/form/Select';
import { EXPORT_TYPES, SERVICE } from '../../../data/constants';

export default {
  name: 'DataExports',
  metaInfo: { title: 'Données' },
  components: {
    'ni-select': Select,
  },
  data () {
    return {
      exportTypeOptions: EXPORT_TYPES,
      type: SERVICE,
    }
  },
  methods: {
    async exportCsv () {
      try {
        const type = EXPORT_TYPES.find(t => t.value === this.type);
        if (!type) NotifyNegative('Impossible de téléchager le document');

        const csv = await this.$exports.getCsv({ type: type.value });
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
