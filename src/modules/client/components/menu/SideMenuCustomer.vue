<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <ni-menu-item class="customer-menu-size" name="customer agenda" icon="date_range" label="Planning" />
    <q-separator />
    <ni-menu-item class="customer-menu-size" name="customer documents" icon="euro_symbol" label="Facturation" />
    <q-separator />
    <ni-menu-item class="customer-menu-size" name="customer subscription" icon="playlist_add" label="Abonnement" />
    <q-separator />
    <template v-if="hasContracts">
      <ni-menu-item class="customer-menu-size" name="customer contracts" icon="description" label="Contrats" />
      <q-separator />
    </template>
    <ni-side-menu-footer :label="user.identity.lastname" :userId="user._id" />
  </q-list>
</template>

<script>
import MenuItem from '@components/menu/MenuItem';
import SideMenuFooter from '@components/menu/SideMenuFooter';
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
        planning: { open: false },
        benef: { open: false },
        administrative: { open: false },
      },
    }
  },
  computed: {
    hasContracts () {
      return this.user && this.user.customers && this.user.customers.length > 0 && this.user.customers[0].contracts &&
        this.user.customers[0].contracts.length > 0;
    },
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>

<style lang="stylus" scoped>
.q-item
  & .q-item__label
    font-size: 1rem
</style>
