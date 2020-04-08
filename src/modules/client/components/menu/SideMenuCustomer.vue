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
    <ni-menu-item v-if="hasBillingAssistance" class="customer-menu-size" name="customer contact" icon="contact_support"
      label="Contact" />
    <q-separator v-if="hasBillingAssistance" />
    <ni-menu-item class="customer-menu-size" name="customer documents" icon="euro_symbol" label="Facturation" />
    <q-separator />
    <ni-menu-item class="customer-menu-size" name="customer subscription" icon="playlist_add" label="Abonnement" />
    <q-separator />
    <template v-if="hasContracts">
      <ni-menu-item class="customer-menu-size" name="customer contracts" icon="description" label="Contrats" />
      <q-separator />
    </template>
    <ni-side-menu-footer :label="loggedUser.identity.lastname" :userId="loggedUser._id" />
  </q-list>
</template>

<script>
const get = require('lodash/get');
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
        planning: { open: false },
        benef: { open: false },
        administrative: { open: false },
      },
    }
  },
  computed: {
    hasContracts () {
      return this.loggedUser && this.loggedUser.customers && this.loggedUser.customers.length > 0 && this.loggedUser.customers[0].contracts &&
        this.loggedUser.customers[0].contracts.length > 0;
    },
    loggedUser () {
      return this.$store.getters['main/loggedUser'];
    },
    hasBillingAssistance () {
      return get(this.loggedUser, 'company.billingAssistance');
    },
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>
