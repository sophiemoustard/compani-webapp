<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Questionnaires" class="q-mb-xl" />
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  metaInfo: { title: 'Questionnaires' },
  name: 'QuestionnairesDirectory',
  components: {
    'ni-title-header': TitleHeader,
  },
};
</script>
