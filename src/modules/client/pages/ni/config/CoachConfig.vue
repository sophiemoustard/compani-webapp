<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Coachs" class="q-mb-xl" />
    <ni-coach-list :company="company" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapGetters } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import CoachList from '@components/table/CoachList';

const metaInfo = { title: 'Configuration coachs' };

export default {
  name: 'CoachConfig',
  components: {
    'ni-title-header': TitleHeader,
    'ni-coach-list': CoachList,
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
};
</script>
