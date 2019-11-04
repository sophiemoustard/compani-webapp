<template>
  <q-layout view="hhh Lpr lff">
    <q-page-sticky v-if="$q.platform.is.mobile" position="bottom-left" :offset="[18, 18]">
      <q-btn class="menu-icon" color="primary" round dense @click="toggleLeft" icon="menu" />
    </q-page-sticky>
    <q-drawer :mini="isMini" :mini-width="30" :width="250" side="left" :value="toggleDrawer"
      @click="toggleMenu">
      <side-menu-coach :ref="sidemenusRefs" v-if="user && !isAuxiliary && user.role.name !== HELPER && !isMini"
        :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="user && isAuxiliary && !isMini" :user="user" />
      <side-menu-customer :ref="sidemenusRefs" v-if="user && user.role.name === HELPER && !isMini" :user="user" />
      <div :class="[!isMini ? 'q-mini-drawer-hide' : 'q-mini-drawer-only']" class="absolute" >
        <q-btn :class="[!isMini ? 'chevron-left' : 'chevron-right']" class="chevron" dense round unelevated
          :icon="menuIcon" @click="isMini = !isMini" />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import SideMenuCoach from '../components/menu/SideMenuCoach'
import SideMenuAuxiliary from '../components/menu/SideMenuAuxiliary'
import SideMenuCustomer from '../components/menu/SideMenuCustomer'
import { AUXILIARY, PLANNING_REFERENT, HELPER } from '../data/constants.js';

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
    isAuxiliary () {
      return this.user.role.name === AUXILIARY || this.user.role.name === PLANNING_REFERENT;
    },
    menuIcon () {
      return this.isMini ? 'view_headline' : 'chevron_left';
    },
    toggleDrawer () {
      return this.$store.state.main.toggleDrawer;
    },
    sidemenusRefs () {
      if (this.user && !this.isAuxiliary) {
        return 'defaultMenu';
      }
      return 'auxiliaryMenu';
    },
  },
  methods: {
    toggleLeft () {
      this.$store.commit('main/setToggleDrawer', !this.toggleDrawer);
    },
    toggleMenu () {
      this.$store.commit('main/setToggleDrawer', !this.toggleDrawer)
    },
  },
  beforeRouteUpdate (to, from, next) {
    if (this.toggleDrawer && !this.isMini) {
      this.$refs[this.sidemenusRefs].collapsibleClosing(to, from);
      this.$refs[this.sidemenusRefs].collapsibleEntering(to);
    }

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
