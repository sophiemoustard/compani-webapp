<template>
  <q-page class="neutral-background" padding>
    <h4>Coachs</h4>
    <ni-coach-config-table :users="users" :company="loggedCompany" @refreshUsers="getUsers" />
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import Users from '@api/Users';
import CoachConfigTable from '@components/table/CoachConfigTable';
import { CLIENT_ADMIN, COACH } from '@data/constants';

export default {
  name: 'CoachConfig',
  components: {
    'ni-coach-config-table': CoachConfigTable,
  },
  data () {
    return {
      users: [],
    };
  },
  computed: {
    ...mapGetters({ loggedCompany: 'main/company' }),
  },
  async mounted () {
    await this.getUsers();
  },
  methods: {
    async getUsers () {
      try {
        this.usersLoading = true;
        this.users = await Users.list({ role: [CLIENT_ADMIN, COACH], company: this.loggedCompany._id });
      } catch (e) {
        console.error(e);
        this.users = [];
      } finally {
        this.usersLoading = false;
      }
    },
  },
}
</script>
