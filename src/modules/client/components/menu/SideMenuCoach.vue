<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <template v-for="route of routes">
      <q-expansion-item :ref="route.ref" v-model="activeRoutes[route.ref].open" :label="route.label" :key="route.ref">
        <ni-menu-item v-for="item of route.children" :name="item.name" :icon="item.icon" :label="item.label"
          :key="item.name" />
      </q-expansion-item>
      <q-separator :key="`separator-${route.ref}`" />
    </template>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="loggedUser._id" :interface-type="interfaceType" />
  </q-list>
</template>

<script>
import { mapGetters } from 'vuex';
import { CLIENT_ADMIN, CLIENT } from '@data/constants';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import MenuItem from '@components/menu/MenuItem';
import { sideMenuMixin } from '@mixins/sideMenuMixin';
import { defineAbilitiesFor } from '@helpers/ability';

export default {
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      CLIENT_ADMIN,
      interfaceType: CLIENT,
      activeRoutes: {
        planning: { open: false },
        customers: { open: false },
        teams: { open: false },
        billing: { open: false },
        pay: { open: false },
        exports: { open: false },
        configuration: { open: false },
      },
    };
  },
  computed: {
    ...mapGetters({ clientRole: 'main/clientRole', company: 'main/company' }),
    isAdmin () {
      return CLIENT_ADMIN === this.clientRole;
    },
    routes () {
      const routes = [
        {
          ref: 'teams',
          label: 'Équipes',
          children: [
            { name: 'ni auxiliaries', icon: 'contacts', label: 'Répertoire auxiliaires' },
            { name: 'ni auxiliaries staff register', icon: 'view_headline', label: 'Registre unique du personnel' },
            { name: 'ni auxiliaries dashboard', icon: 'dashboard', label: 'Tableau de bord' },
          ],
        }, {
          ref: 'planning',
          label: 'Planning',
          children: [
            { name: 'ni planning auxiliaries', icon: 'date_range', label: 'Auxiliaires' },
            { name: 'ni planning customers', icon: 'date_range', label: 'Bénéficiaires' },
          ],
        }, {
          ref: 'customers',
          label: 'Beneficiaires',
          children: [
            { name: 'ni customers', icon: 'contacts', label: 'Répertoire bénéficiaires' },
            { name: 'ni customers fundings monitoring', icon: 'view_headline', label: "Suivi des plans d'aide" },
          ],
        }, {
          ref: 'billing',
          label: 'Facturation',
          children: [
            { name: 'ni billing to bill', icon: 'credit_card', label: 'À facturer' },
            { name: 'ni billing credit note', icon: 'mdi-credit-card-refund', label: 'Avoirs' },
            { name: 'ni billing clients balances', icon: 'mdi-scale-balance', label: 'Balances clients' },
            { name: 'ni billing tpp bill slips', icon: 'view_headline', label: 'Bordereaux tiers payeurs' },
            { name: 'ni billing debits archive', icon: 'mdi-archive', label: 'Archive prélèvements' },
          ],
        }, {
          ref: 'pay',
          label: 'Paie',
          children: [
            { name: 'ni pay contract monitoring', icon: 'insert_drive_file', label: 'Suivi Contracts/Avenants' },
            { name: 'ni pay absences', icon: 'calendar_today', label: 'Absences' },
            { name: 'ni pay contract ends', icon: 'description', label: 'STC' },
            { name: 'ni pay to pay', icon: 'euro_symbol', label: 'Paie mensuelle' },
          ],
        }, {
          ref: 'exports',
          label: 'Exports',
          children: [
            { name: 'ni exports data', icon: 'list_alt', label: 'Données' },
            { name: 'ni exports history', icon: 'history', label: 'Historique' },
          ],
        }, {
          ref: 'configuration',
          label: 'Configuration',
          children: [
            { name: 'ni config company', icon: 'house', label: 'Configuration générale' },
            { name: 'ni config rh', icon: 'accessibility', label: 'Configuration RH' },
            { name: 'ni config customers', icon: 'settings', label: 'Configuration bénéficiaires' },
            { name: 'ni config coach', icon: 'people', label: 'Coachs' },
            { name: 'ni config tags', icon: 'list_alt', label: 'Tags' },
          ],
        },
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes
        .map(r => ({ ...r, children: r.children.filter(c => ability.can('read', c.name)) }))
        .filter(r => r.children.length);
    },
  },
  mounted () {
    this.collapsibleOpening();
  },
}
</script>
