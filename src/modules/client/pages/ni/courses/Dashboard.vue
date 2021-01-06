<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="La formation Compani dans ma structure" class="q-mb-xl" />
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  name: 'CourseDashboard',
  metaInfo: { title: 'Tableau de bord des formations' },
  components: { 'ni-title-header': TitleHeader },
};
</script>

<style lang="stylus" scoped>
</style>
