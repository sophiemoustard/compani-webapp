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
import { COACH_ROLES, AUXILIARY, PLANNING_REFERENT } from '../../data/constants';

export default {
  props: {
    userId: String,
    label: String,
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    userRole () {
      return this.user.role.client.name;
    },
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.userRole);
    },
    userCanFeedback () {
      return [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT].includes(this.userRole);
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
      if (this.$router.currentRoute.name !== 'account info') {
        return this.$router.push({ name: 'account info', params: { id: this.userId } });
      }
    },
  },
}
</script>
