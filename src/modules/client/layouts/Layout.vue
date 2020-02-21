<template>
  <q-layout view="hhh Lpr lff">
    <q-drawer :mini="isMini" :mini-width="30" :width="250" side="left" :value="toggleDrawer" @input="toggleMenu">
      <side-menu-coach :ref="sidemenusRefs" v-if="isCoach && !isMini" :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="isAuxiliary && !isMini" :user="user" />
      <side-menu-customer :ref="sidemenusRefs" v-if="isHelper && !isMini" :user="user" />
      <div :class="[!isMini ? 'q-mini-drawer-hide' : 'q-mini-drawer-only']" class="absolute" >
        <q-btn :class="[!isMini ? 'chevron-left' : 'chevron-right']" class="chevron" dense round unelevated
          :icon="menuIcon" @click="isMini = !isMini" />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>
    <q-page-sticky v-if="$q.platform.is.mobile" position="bottom-left" :offset="[18, 18]">
      <q-btn class="menu-icon" color="primary" round dense @click="toggleMenu(true)" icon="menu" />
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import get from 'lodash/get';
import SideMenuCoach from 'src/modules/client/components/menu/SideMenuCoach'
import SideMenuAuxiliary from 'src/modules/client/components/menu/SideMenuAuxiliary'
import SideMenuCustomer from 'src/modules/client/components/menu/SideMenuCustomer'
import { AUXILIARY_ROLES, HELPER, COACH_ROLES } from 'src/core/data/constants.js';

export default {
  components: {
    'side-menu-coach': SideMenuCoach,
    'side-menu-auxiliary': SideMenuAuxiliary,
    'side-menu-customer': SideMenuCustomer,
  },
  data () {
    return {
      HELPER,
      isMini: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'main/user',
    }),
    userRole () {
      return get(this.user, 'role.client.name') || null;
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.userRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.userRole);
    },
    isHelper () {
      return this.userRole === HELPER;
    },
    menuIcon () {
      return this.isMini ? 'view_headline' : 'chevron_left';
    },
    toggleDrawer () {
      return this.$store.state.main.toggleDrawer;
    },
    sidemenusRefs () {
      if (!this.user) return 'defaultMenu'

      if (this.isAuxiliary) return 'auxiliaryMenu';
      if (this.isCoach) return 'coachMenu'
      if (this.isHelper) return 'helperMenu';

      return 'defaultMenu';
    },
  },
  methods: {
    toggleMenu (value) {
      this.$store.commit('main/setToggleDrawer', value);
    },
  },
  beforeRouteUpdate (to, from, next) {
    if (this.toggleDrawer && !this.isMini) this.$refs[this.sidemenusRefs].collapsibleClosing(to, from);

    next();
  },
}
</script>

<style lang="stylus" scoped>
  .q-page-sticky
    z-index: 10
    @media (min-width: 1025px)
      display: none;

  .chevron
    background-color: white
    border: 1px solid $light-grey
    top: 5px
    position: fixed
    z-index: 5000
    &-left
      left: 235px
    &-right
      left: 15px
    @media (max-width: 1024px)
      display: none

  .q-toolbar
    color: $primary

  .q-btn
    color: $dark-grey
    &:hover
      color: $primary

  .menu-icon
    font-size: 17px;
</style>
