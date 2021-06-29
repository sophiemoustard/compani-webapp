<template>
  <q-page padding class="client-background">
    <div v-if="loggedUser">
      <ni-title-header title="Documents de paie" class="q-mb-xl" />
      <profile-pay />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  props: {
    id: { type: String, required: true },
  },
  components: {
    'ni-title-header': TitleHeader,
    'profile-pay': ProfilePay,
  },
  metaInfo: { title: 'Documents de paie' },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
};
</script>
