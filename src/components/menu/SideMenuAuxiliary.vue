<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator v-if="!isAuxiliaryWithoutCompany" />
    <q-expansion-item v-if="!isAuxiliaryWithoutCompany" ref="planning" v-model="activeRoutes.planning.open" label="Planning">
      <ni-menu-item name="auxiliary agenda" icon="event" label="Le mien" />
      <ni-menu-item name="auxiliaries planning" icon="face" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="people" label="Bénéficiaires" />
    </q-expansion-item>
    <q-separator v-if="!isAuxiliaryWithoutCompany" />
    <q-expansion-item v-if="!isAuxiliaryWithoutCompany" ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
      <ni-menu-item name="profile customers" :params="{ id: user._id }" icon="account_box" label="Fiches" />
      <ni-menu-item name="customers fundings monitoring" icon="view_headline" label="Suivi des plans d'aide" />
    </q-expansion-item>
    <q-separator v-if="!isAuxiliaryWithoutCompany" />
    <q-expansion-item v-if="!isAuxiliaryWithoutCompany" ref="administrative" v-model="activeRoutes.administrative.open" label="Administratif">
      <ni-menu-item name="auxiliary personal info" :params="{ id: user._id }" icon="person" label="Infos personnelles" />
      <ni-menu-item name="profile salaries" :params="{ id: user._id }" icon="layers" label="Paie" />
      <ni-menu-item name="profile docs" :params="{ id: user._id }" icon="insert_drive_file" label="Documents" />
      <ni-menu-item name="profile contracts" icon="description" label="Contrats" />
    </q-expansion-item>
    <q-separator v-if="!isAuxiliaryWithoutCompany" />
    <q-expansion-item v-if="!isAuxiliaryWithoutCompany" ref="teams" v-model="activeRoutes.teams.open" label="Équipes">
      <ni-menu-item name="teams directory" :params="{ id: user._id }" icon="group" label="Répertoire" />
      <ni-menu-item name="dashboard" icon="dashboard" label="Tableau de bord" />
    </q-expansion-item>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" @myClick="connectToBotMessenger" isAuxiliary />
  </q-list>
</template>

<script>
import { Cookies } from 'quasar';

import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';
import SideMenuFooter from './SideMenuFooter.vue';
import { AUXILIARY_WITHOUT_COMPANY } from '../../data/constants';
import get from 'lodash/get';

export default {
  props: ['user'],
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
        teams: { open: false },
      },
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    isAuxiliaryWithoutCompany () {
      return get(this, 'user.role.name', null) === AUXILIARY_WITHOUT_COMPANY;
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
