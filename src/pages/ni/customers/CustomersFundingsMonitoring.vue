`<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Suivi des plans d'aide</h4>
    </div>
    <ni-large-table>
    </ni-large-table>
  </q-page>
</template>

<script>
import LargeTable from '../../../components/table/LargeTable';

export default {
  name: 'CustomersFundingsMonitoring',
  metaInfo: {
    title: 'Suivi des plans d\'aide',
  },
  components: {
    'ni-large-table': LargeTable,
  },
}
</script>
