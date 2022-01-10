<template>
  <q-page padding class="client-background q-pb-xl">
    <ni-title-header title="Données" class="q-mb-xl" />
    <div class="row">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" />
    </div>
    <q-btn label="Exporter" no-caps unelevated text-color="white" color="primary" icon="import_export"
      @click="exportCsv" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import Exports from '@api/Exports';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import { downloadFile } from '@helpers/file';
import { EXPORT_TYPES, SERVICE } from '@data/constants';

const metaInfo = { title: 'Données' };

export default {
  name: 'DataExports',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      exportTypeOptions: EXPORT_TYPES,
      type: SERVICE,
    };
  },
  methods: {
    async exportCsv () {
      try {
        const type = EXPORT_TYPES.find(t => t.value === this.type);
        if (!type) NotifyNegative('Impossible de téléchager le document.');

        const csv = await Exports.getCsv({ type: type.value });
        await downloadFile(csv, `${type.label}.csv`);

        NotifyPositive('Document téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document.');
      }
    },
  },
};
</script>
