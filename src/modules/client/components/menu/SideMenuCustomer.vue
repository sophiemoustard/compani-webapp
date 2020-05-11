<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <template v-for="route of routes">
      <template v-if="route.condition">
        <ni-menu-item class="customer-menu-size" :name="route.name" :icon="route.icon" :label="route.label"
          :key="route.name" />
        <q-separator :key="`separator-${route.name}`" />
      </template>
    </template>
    <ni-side-menu-footer :label="loggedUser.identity.lastname" :userId="loggedUser._id" :interface-type="interfaceType" />
  </q-list>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import Customers from '@api/Customers';
import MenuItem from '@components/menu/MenuItem';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import { sideMenuMixin } from '@mixins/sideMenuMixin';
import { CLIENT } from '@data/constants'
import { defineAbilitiesFor } from '@helpers/ability';

export default {
  name: 'SideMenuCustomer',
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      activeRoutes: {
        planning: { open: false },
        customers: { open: false },
        administrative: { open: false },
      },
      interfaceType: CLIENT,
    }
  },
  computed: {
    ...mapGetters({ customer: 'customer/getCustomer', company: 'main/company', clientRole: 'main/clientRole' }),
    hasContracts () {
      return this.loggedUser && this.loggedUser.customers && this.loggedUser.customers.length > 0 &&
        this.loggedUser.customers[0].contracts && this.loggedUser.customers[0].contracts.length > 0;
    },
    hasBillingAssistance () {
      return get(this.loggedUser, 'company.billingAssistance');
    },
    routes () {
      const routes = [
        { name: 'customers agenda', icon: 'date_range', label: 'Planning', condition: true },
        {
          name: 'customers contact',
          icon: 'contact_support',
          label: 'Contact',
          condition: this.hasBillingAssistance || (this.customer && this.customer.referent),
        },
        { name: 'customers documents', icon: 'euro_symbol', label: 'Facturation', condition: true },
        { name: 'customers subscription', icon: 'playlist_add', label: 'Abonnement', condition: true },
        { name: 'customers contracts', icon: 'description', label: 'Contrats', condition: this.hasContracts },
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes.filter(r => ability.can('read', r.name));
    },
  },
  async mounted () {
    this.collapsibleOpening();
    if (!this.customer) await this.refreshCustomer();
  },
  methods: {
    async refreshCustomer () {
      if (this.loggedUser && this.loggedUser.customers) {
        const customer = await Customers.getById(this.loggedUser.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
      }
    },
  },
}
</script>
