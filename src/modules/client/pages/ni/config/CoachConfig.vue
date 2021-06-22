<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Coachs" class="q-mb-xl" />
    <ni-coach-list :company="company" />
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import CoachList from '@components/table/CoachList';

export default {
  name: 'CoachConfig',
  components: {
    'ni-title-header': TitleHeader,
    'ni-coach-list': CoachList,
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
};
</script>
