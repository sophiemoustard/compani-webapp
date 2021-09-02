<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures manuelles" padding />

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer une facture" />
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  name: 'ManualBills',
  metaInfo: { title: 'Factures manuelles' },
  components: {
    'ni-title-header': TitleHeader,
  },
};
</script>
