<template>
  <q-page padding class="neutral-background">
    <div v-if="loggedUser">
      <h4>Documents de paie</h4>
      <profile-pay/>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  props: ['id'],
  components: {
    'profile-pay': ProfilePay,
  },
  metaInfo: { title: 'Documents de paie' },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
}
</script>
