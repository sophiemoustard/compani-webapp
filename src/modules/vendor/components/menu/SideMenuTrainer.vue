<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="management" v-model="activeRoutes.management.open" label="Gestion">
      <ni-menu-item name="trainer courses directory" icon="mdi-teach" label="Formations" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="administrative" v-model="activeRoutes.administrative.open" label="Administration">
      <ni-menu-item name="trainer personal info" :params="{ trainerId: loggedUser._id }" icon="person"
        label="Infos personnelles" />
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
        administrative: { open: false },
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
