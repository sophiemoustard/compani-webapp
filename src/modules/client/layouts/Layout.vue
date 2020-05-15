<template>
  <q-layout view="hhh Lpr lff">
    <q-drawer :mini="isMini" :mini-width="30" :width="250" side="left" :value="drawer" @input="toggleMenu">
      <side-menu-coach ref="coachMenu" v-if="isCoach && !isMini" />
      <side-menu-auxiliary ref="auxiliaryMenu" v-if="isAuxiliary && !isMini" />
      <side-menu-customer ref="helperMenu" v-if="isHelper && !isMini" />
      <div :class="chevronContainerClasses">
        <q-btn :class="chevronClasses" dense round unelevated :icon="menuIcon" @click="isMini = !isMini" />
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
import { mapGetters } from 'vuex';
import { AUXILIARY_ROLES, HELPER, COACH_ROLES } from '@data/constants';
import { layoutMixin } from '@mixins/layoutMixin';
import SideMenuCoach from 'src/modules/client/components/menu/SideMenuCoach';
import SideMenuAuxiliary from 'src/modules/client/components/menu/SideMenuAuxiliary';
import SideMenuCustomer from 'src/modules/client/components/menu/SideMenuCustomer';

export default {
  metaInfo: {
    meta: [
      { name: 'msapplication-config', content: '/statics/favicon_meta/browserconfig_rose.xml' },
    ],
    link: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/favicon_rose' +
          '/apple-touch-icon.png?v=A0mxgJvdbx',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/favicon_rose' +
          '/favicon-32x32.png?v=A0mxgJvdbx',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/favicon_rose' +
          '/favicon-16x16.png?v=A0mxgJvdbx',
      },
      {
        rel: 'manifest',
        href: 'statics/favicon_meta/site_rose.webmanifest',
      },
      {
        rel: 'shortcut icon',
        href: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/favicon_rose' +
          '/favicon.ico?v=A0mxgJvdbx',
      },
    ],
  },
  name: 'ClientLayout',
  components: {
    'side-menu-coach': SideMenuCoach,
    'side-menu-auxiliary': SideMenuAuxiliary,
    'side-menu-customer': SideMenuCustomer,
  },
  mixins: [layoutMixin],
  data () {
    return {
      HELPER,
    }
  },
  computed: {
    ...mapGetters({ clientRole: 'main/clientRole' }),
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    isHelper () {
      return this.clientRole === HELPER;
    },
    sidemenusRefs () {
      if (!this.loggedUser) return 'defaultMenu';

      if (this.isAuxiliary) return 'auxiliaryMenu';
      if (this.isCoach) return 'coachMenu';
      if (this.isHelper) return 'helperMenu';

      return 'defaultMenu';
    },
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
