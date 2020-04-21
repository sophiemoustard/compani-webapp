<template>
  <div class="sidemenu-footer">
    <q-item class="full-width">
      <q-item-section class="sidemenu-footer-user">{{ label }}</q-item-section>
      <div class="sidemenu-footer-icons">
        <q-item-section v-if="userCanFeedback">
          <q-icon size="xs" name="mdi-lightbulb-on-outline" class="feedback"
            @click.native="openExtenalUrl('https://compani.atlassian.net/servicedesk/customer/portal/2')" />
        </q-item-section>
        <q-item-section v-if="isAuxiliaryWithCompany">
          <q-icon size="xs" class="messenger" name="mdi-facebook-messenger"
            @click.native="clickHandler" />
        </q-item-section>
        <q-item-section>
          <q-icon size="xs" class="person" name="person" @click.native="goToProfile" />
        </q-item-section>
      </div>
    </q-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { COACH_ROLES, AUXILIARY, PLANNING_REFERENT } from '@data/constants';

export default {
  props: {
    userId: String,
    label: String,
  },
  computed: {
    ...mapGetters({
      clientRole: 'main/clientRole',
    }),
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
    userCanFeedback () {
      return [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
  },
  methods: {
    clickHandler () {
      this.$emit('myClick');
    },
    openExtenalUrl (url) {
      window.open(url, '_blank');
    },
    goToProfile () {
      if (!/account info/.test(this.$router.currentRoute.name)) {
        return /\/ad\//.test(this.$router.currentRoute.path)
          ? this.$router.push({ name: 'vendor account info', params: { id: this.userId } })
          : this.$router.push({ name: 'client account info', params: { id: this.userId } });
      }
    },
  },
}
</script>
