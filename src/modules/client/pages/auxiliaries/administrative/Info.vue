<template>
  <q-page padding class="client-background">
    <div v-if="loggedUser">
      <h4>Informations personnelles</h4>
      <profile-info />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';

export default {
  components: {
    ProfileInfo,
  },
  metaInfo: { title: 'Infos personnelles' },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
};
</script>
