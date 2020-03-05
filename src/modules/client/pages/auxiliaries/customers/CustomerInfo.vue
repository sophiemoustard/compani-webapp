<template>
  <q-page padding class="neutral-background">
    <div v-if="customer">
      <div class="row items-center col-xs-12 header-margin">
        <div>
          <q-icon class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary"
            @click.native="$router.go(-1)" />
        </div>
        <h4 class="no-margin">{{ customer.identity | formatIdentity('FL') }}</h4>
      </div>
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { formatIdentity } from '@helpers/utils';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp.vue';

export default {
  components: {
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    customerId: { type: String },
  },
  metaInfo: { title: 'Fiche bénéficiaire' },
  computed: {
    customer () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { customerId: this.customerId });
  },
  filters: {
    formatIdentity,
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  },
}
</script>

<style lang="stylus" scoped>
  .header-margin
    margin-bottom: 35px

  .gutter-profile
    margin-top: -24px
    margin-left: -24px
    & > div
      padding-top: 24px
      padding-left: 24px
    &-x
      margin-top: -24px
      & > div
        padding-top: 24px
</style>
