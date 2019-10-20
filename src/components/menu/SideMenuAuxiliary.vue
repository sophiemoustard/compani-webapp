<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
      <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png"
          alt="Compani logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <ni-menu-item name="auxiliary agenda" icon="event" label="Le mien" />
      <ni-menu-item name="auxiliaries planning" icon="face" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="people" label="Bénéficiaires" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="benef" v-model="activeRoutes.benef.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.benef.highlight }" label="Bénéficiaires" />
      </template>
      <ni-menu-item name="profile customers" :params="{ id: user._id }" icon="account_box" label="Fiches" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="administrative" v-model="activeRoutes.administrative.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.administrative.highlight }" label="Administratif" />
      </template>
      <ni-menu-item name="auxiliary personal info" :params="{ id: user._id }" icon="person" label="Infos personnelles" />
      <ni-menu-item name="profile salaries" :params="{ id: user._id }" icon="layers" label="Paie" />
      <ni-menu-item name="profile docs" :params="{ id: user._id }" icon="insert_drive_file" label="Documents" />
      <ni-menu-item name="profile contracts" icon="description" label="Contrats" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="team" v-model="activeRoutes.team.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.team.highlight }" label="Équipe" />
      </template>
      <ni-menu-item name="team directory" :params="{ id: user._id }" icon="group" label="Répertoire" />
    </q-collapsible>
    <q-item-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" @myClick="connectToBotMessenger" isAuxiliary />
  </q-list>
</template>

<script>
import { Cookies } from 'quasar';

import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';
import SideMenuFooter from './SideMenuFooter.vue';

export default {
  props: ['user'],
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      activeRoutes: {
        planning: {
          open: false,
          highlight: false,
        },
        benef: {
          open: false,
          highlight: false,
        },
        administrative: {
          open: false,
          highlight: false,
        },
        team: {
          open: false,
          hightlight: false,
        },
      },
    }
  },
  mounted () {
    this.collapsibleOpening();
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
  @import '~variables'
  .messenger-blue-text
    color: $messenger-blue

  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
