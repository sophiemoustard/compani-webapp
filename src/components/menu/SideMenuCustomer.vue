<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
     <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png" alt="Compani logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <ni-menu-item class="customer-menu-size" name="customer agenda" icon="date range" label="Planning" />
    <q-item-separator />
    <ni-menu-item class="customer-menu-size" name="customer documents" icon="euro_symbol" label="Facturation" />
    <q-item-separator />
    <ni-menu-item class="customer-menu-size" name="customer subscription" icon="playlist_add" label="Abonnement" />
    <q-item-separator />
    <template v-if="hasContracts">
      <ni-menu-item class="customer-menu-size" name="customer contracts" icon="description" label="Contrats" />
      <q-item-separator />
    </template>
    <ni-side-menu-footer :label="user.identity.lastname" :userId="user._id" />
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';
import SideMenuFooter from './SideMenuFooter.vue';

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
      },
    }
  },
  computed: {
    hasContracts () {
      return this.user && this.user.customers && this.user.customers.length > 0 && this.user.customers[0].contracts && this.user.customers[0].contracts.length > 0;
    },
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-layout-drawer .q-list .router-link-active
    color: $primary !important

  /deep/ .customer-menu-size > .q-item-side > .q-item-icon
    font-size: 1rem

  /deep/ .customer-menu-size .q-item-main > .q-item-label
    font-size: 1rem

</style>
