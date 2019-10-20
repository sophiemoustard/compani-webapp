<template>
  <q-layout view="hhh Lpr lff">
    <q-page-sticky v-if="$q.platform.is.mobile" position="bottom-left" :offset="[18, 18]">
      <q-btn class="menu-icon" color="primary" round dense @click="toggleLeft" icon="menu" />
    </q-page-sticky>

    <q-btn v-if="!enableMini" size="sm" flat round icon="chevron_left" @click="enableMini = !enableMini"
      class="chevron chevron-left" />
    <q-btn v-else flat round icon="view_headline" @click="enableMini = !enableMini" class="chevron chevron-right"
      size="sm" />
    <q-drawer :mini="enableMini" :mini-width="30" :width="250" side="left" v-model="toggleDrawer">
      <side-menu-coach :ref="sidemenusRefs" v-if="user && !isAuxiliary && user.role.name !== HELPER && !enableMini"
        :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="user && isAuxiliary && !enableMini" :user="user" />
      <side-menu-customer :ref="sidemenusRefs" v-if="user && user.role.name === HELPER && !enableMini" :user="user" />
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
      enableMini: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'main/user',
    }),
    isAuxiliary () {
      return this.user.role.name === AUXILIARY || this.user.role.name === PLANNING_REFERENT;
    },
    toggleDrawer: {
      get () {
        return this.$store.state.main.toggleDrawer;
      },
      set (val) {
        this.$store.commit('main/setToggleDrawer', !this.toggleDrawer)
      },
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
  },
  beforeRouteUpdate (to, from, next) {
    if (this.toggleDrawer && !this.enableMini) {
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
