<template>
  <q-layout view="hhh Lpr lff">
    <q-drawer :mini="isMini" :mini-width="30" :width="250" side="left" :value="drawer" @input="toggleMenu">
      <q-list v-if="!isMini" class="no-border sidemenu-alenvi sidemenu-flex">
        <div class="sidemenu-header">
          <q-item-label header class="justify-center">
            <img :src="companiLogo" alt="Compani logo">
          </q-item-label>
        </div>
        <q-separator />
        <template v-for="route of routes">
          <template v-if="isHelper">
            <ni-menu-item class="customer-menu-size" :name="route.name" :icon="route.icon" :label="route.label"
              :key="route.name" />
            <q-separator :key="`separator-${route.name}`" />
          </template>
          <template v-else >
            <q-expansion-item :ref="route.ref" v-model="activeRoutes[route.ref].open" :label="route.label"
              :key="route.ref">
              <ni-menu-item v-for="item of route.children" :name="item.name" :icon="item.icon" :label="item.label"
                :key="item.name" :params="item.params" />
            </q-expansion-item>
          <q-separator :key="`separator-${route.ref}`" />
          </template>
        </template>
        <ni-side-menu-footer :label="footerLabel" :userId="loggedUser._id" :interface-type="interfaceType"
          @click="connectToBotMessenger"/>
      </q-list>
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
import { Cookies } from 'quasar';
import { layoutMixin } from '@mixins/layoutMixin';
import { sideMenuMixin } from '@mixins/sideMenuMixin';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import MenuItem from '@components/menu/MenuItem';
import { CLIENT } from '@data/constants';
import { menuItemsMixin } from '../mixins/menuItemsMixin'

export default {
  name: 'ClientLayout',
  mixins: [layoutMixin, sideMenuMixin, menuItemsMixin],
  components: {
    'ni-side-menu-footer': SideMenuFooter,
    'ni-menu-item': MenuItem,
  },
  data () {
    return {
      interfaceType: CLIENT,
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    footerLabel () {
      if (this.isCoach || this.isAuxiliary) return this.userFirstname;
      else return this.loggedUser.identity.lastname;
    },
  },
  methods: {
    connectToBotMessenger () {
      const token = Cookies.get('alenvi_token');
      window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
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
    border: 1px solid $middle-grey
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
