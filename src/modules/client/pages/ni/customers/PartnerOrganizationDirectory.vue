<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Structures partenaires" class="q-mb-xl" />
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  metaInfo: { title: 'Structures partenaires' },
  name: 'PartnerOrgarnizationDirectory',
  components: {
    'ni-title-header': TitleHeader,
  },
};
</script>
