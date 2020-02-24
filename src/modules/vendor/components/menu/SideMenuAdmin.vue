<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="users" v-model="activeRoutes.users.open" label="Utilisateurs">
      <ni-menu-item name="companies" icon="house" label="Structures" />
      <ni-menu-item name="trainer" icon="view_headline" label="Formateurs" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration">
      <ni-menu-item name="courses" icon="date_range" label="Formations" />
    </q-expansion-item>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" />
  </q-list>
</template>

<script>
import MenuItem from '@components/menu/MenuItem.vue';
import SideMenuFooter from '@components/menu/SideMenuFooter.vue';
import { sideMenuMixin } from 'src/modules/client/mixins/sideMenuMixin';

export default {
  props: {
    user: Object,
  },
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
  mounted () {
    this.collapsibleOpening();
  },
}
</script>

<style lang="stylus" scoped>
  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
