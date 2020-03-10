<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="users" v-model="activeRoutes.users.open" label="Utilisateurs">
      <ni-menu-item name="companies directory" icon="house" label="Structures" />
      <ni-menu-item name="trainers directory" icon="view_headline" label="Formateurs" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration">
      <ni-menu-item name="programs directory" icon="view_headline" label="Catalogue" />
    </q-expansion-item>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="loggedUser._id" />
  </q-list>
</template>

<script>
import MenuItem from '@components/menu/MenuItem';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import { sideMenuMixin } from '@mixins/sideMenuMixin';

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
      },
    };
  },
  computed: {
    loggedUser () {
      return this.$store.getters['main/loggedUser'];
    },
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>
