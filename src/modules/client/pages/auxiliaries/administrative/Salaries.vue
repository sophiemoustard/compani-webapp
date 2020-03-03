<template>
  <q-page padding class="neutral-background">
    <div v-if="currentUser">
      <h4>Documents de paie</h4>
      <profile-pay/>
    </div>
  </q-page>
</template>

<script>

import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  props: ['id'],
  components: {
    'profile-pay': ProfilePay,
  },
  metaInfo: { title: 'Documents de paie' },
  computed: {
    currentUser () {
      return this.$store.getters['current/user'];
    },
  },
}
</script>
