<template>
  <q-page class="neutral-background" padding>
    <h4>Coachs</h4>
    <ni-coach-config-table :company="loggedCompany" />
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import CoachConfigTable from '@components/table/CoachConfigTable';

export default {
  name: 'CoachConfig',
  components: {
    'ni-coach-config-table': CoachConfigTable,
  },
  computed: {
    ...mapGetters({ loggedCompany: 'main/company' }),
  },
}
</script>
