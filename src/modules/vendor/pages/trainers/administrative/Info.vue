<template>
  <q-page padding class="vendor-background">
    <div v-if="loggedUser">
      <ni-title-header title="Informations personnelles" class="q-mb-xl" />
      <profile-info />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';

export default {
  components: {
    'ni-title-header': TitleHeader,
    'profile-info': ProfileInfo,
  },
  metaInfo: { title: 'Infos personnelles' },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
};
</script>
