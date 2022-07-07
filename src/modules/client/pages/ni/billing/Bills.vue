<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures" padding />
  </q-page>
</template>
<script>
import { useMeta } from 'quasar';
import TitleHeader from '@components/TitleHeader';

export default {
  name: 'Bills',
  components: {
    'ni-title-header': TitleHeader,
  },
  setup () {
    const metaInfo = { title: 'Factures' };
    useMeta(metaInfo);

    return {};
  },
};
</script>
