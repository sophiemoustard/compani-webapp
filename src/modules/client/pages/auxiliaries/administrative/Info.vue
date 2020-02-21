<template>
  <q-page padding class="neutral-background">
    <div v-if="currentUser">
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
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
}
</script>
