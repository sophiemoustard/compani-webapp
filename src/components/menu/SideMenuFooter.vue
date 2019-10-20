<template>
  <div class="sidemenu-footer">
    <q-item class="full-width">
      <q-item-section class="sidemenu-footer-user">{{ label }}</q-item-section>
      <div class="sidemenu-footer-icons">
        <q-item-section v-if="userCanFeedback">
          <q-icon size="xs" name="mdi-lightbulb-on-outline" class="feedback"
            @click.native="openExtenalUrl('https://compani.atlassian.net/servicedesk/customer/portal/2')" />
        </q-item-section>
        <q-item-section v-if="isAuxiliary">
          <q-icon size="xs" class="messenger" name="mdi-facebook-messenger" @click.native="clickHandler" />
        </q-item-section>
        <q-item-section>
          <q-icon size="xs" class="person" name="person" @click.native="goToProfile" />
        </q-item-section>
      </div>
    </q-item>
  </div>
</template>

<script>
import { ADMIN, COACH, AUXILIARY, PLANNING_REFERENT } from '../../data/constants';

export default {
  props: {
    userId: String,
    label: String,
    isAuxiliary: { type: Boolean, default: false },
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    userCanFeedback () {
      return [COACH, ADMIN, AUXILIARY, PLANNING_REFERENT].indexOf(this.user.role.name) !== -1;
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
      return this.$router.push({ name: 'account info', params: { id: this.userId } });
    },
  },
}
</script>
