<template>
  <q-page padding class="client-background">
    <div v-if="loggedUser">
      <ni-title-header title="Documents de paie" class="q-mb-xl" />
      <profile-pay />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

const metaInfo = { title: 'Documents de paie' };

export default {
  props: {
    id: { type: String, required: true },
  },
  components: {
    'ni-title-header': TitleHeader,
    'profile-pay': ProfilePay,
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState('main', ['loggedUser']),
  },
};
</script>
