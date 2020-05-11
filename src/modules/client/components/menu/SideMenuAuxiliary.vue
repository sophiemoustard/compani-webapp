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
          :key="item.name" :params="route.params" />
      </q-expansion-item>
      <q-separator :key="`separator-${route.ref}`" />
    </template>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="loggedUser._id" @myClick="connectToBotMessenger"
      :interface-type="interfaceType"/>
  </q-list>
</template>

<script>
import { Cookies } from 'quasar';
import { mapGetters } from 'vuex';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import MenuItem from '@components/menu/MenuItem';
import { AUXILIARY, PLANNING_REFERENT, CLIENT } from '@data/constants';
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
      activeRoutes: {
        planning: { open: false },
        customers: { open: false },
        administrative: { open: false },
        teams: { open: false },
      },
      interfaceType: CLIENT,
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    ...mapGetters({ clientRole: 'main/clientRole', company: 'main/company' }),
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
    routes () {
      const routes = [
        {
          ref: 'planning',
          label: 'Planning',
          children: [
            { name: 'auxiliaries agenda', icon: 'event', label: 'Le mien' },
            { name: 'ni planning auxiliaries', icon: 'face', label: 'Auxiliaires' },
            { name: 'ni planning customers', icon: 'people', label: 'Bénéficiaires' },
          ],
        }, {
          ref: 'customers',
          label: 'Beneficiaires',
          children: [
            { name: 'auxiliaries customers', icon: 'contacts', label: 'Fiches' },
            { name: 'ni customers fundings monitoring', icon: 'view_headline', label: "Suivi des plans d'aide" },
          ],
        }, {
          ref: 'administrative',
          label: 'Administratif',
          children: [
            {
              name: 'auxiliaries info',
              params: { id: this.loggedUser._id },
              icon: 'person',
              label: 'Infos personnelles',
            },
            { name: 'auxiliaries pay', params: { id: this.loggedUser._id }, icon: 'layers', label: 'Paie' },
            {
              name: 'auxiliaries docs',
              params: { id: this.loggedUser._id },
              icon: 'insert_drive_file',
              label: 'Documents',
            },
            { name: 'auxiliaries contracts', icon: 'description', label: 'Contrats' },
          ],
        }, {
          ref: 'teams',
          label: 'Équipes',
          children: [
            { name: 'auxiliaries teams', icon: 'contacts', label: 'Répertoire' },
            { name: 'ni auxiliaries dashboard', icon: 'dashboard', label: 'Tableau de bord' },
          ],
        },
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes
        .map(r => ({ ...r, children: r.children.filter(c => ability.can('read', c.name)) }))
        .filter(r => r.children.length);
    },
  },
  methods: {
    connectToBotMessenger () {
      const token = Cookies.get('alenvi_token');
      window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
    },
  },
}
</script>
