<template>
  <q-page class="client-background" padding>
    <h4>Coachs</h4>
    <ni-coach-list :company="loggedCompany" />
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import CoachList from '@components/table/CoachList';

export default {
  name: 'CoachConfig',
  components: {
    'ni-coach-list': CoachList,
  },
  computed: {
    ...mapGetters({ loggedCompany: 'main/getCompany' }),
  },
};
</script>
