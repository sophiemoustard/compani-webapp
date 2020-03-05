<template>
  <q-page padding class="neutral-background">
    <div v-if="loggedUser">
      <h4>Informations personnelles</h4>
      <profile-info />
    </div>
  </q-page>
</template>

<script>

import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';

export default {
  props: ['id'],
  components: {
    ProfileInfo,
  },
  metaInfo: { title: 'Infos personnelles' },
  computed: {
    loggedUser () {
      return this.$store.getters['main/loggedUser'];
    },
  },
}
</script>
