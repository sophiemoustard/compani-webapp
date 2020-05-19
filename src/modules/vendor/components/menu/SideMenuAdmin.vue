<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="management" v-model="activeRoutes.management.open" label="Gestion">
      <ni-menu-item name="ni management courses" icon="mdi-teach" label="Formations" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="users" v-model="activeRoutes.users.open" label="Utilisateurs">
      <ni-menu-item name="ni users companies" icon="apartment" label="Structures" />
      <ni-menu-item name="ni users trainers" icon="contacts" label="Formateurs" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration">
      <ni-menu-item name="ni users programs" icon="view_headline" label="Catalogue" />
    </q-expansion-item>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="loggedUser._id" :interface-type="interfaceType" />
  </q-list>
</template>

<script>
import MenuItem from '@components/menu/MenuItem';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import { sideMenuMixin } from '@mixins/sideMenuMixin';
import { VENDOR } from '@data/constants'

export default {
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      activeRoutes: {
        users: { open: false },
        configuration: { open: false },
        management: { open: false },
      },
      interfaceType: VENDOR,
    };
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>
