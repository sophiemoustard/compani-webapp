<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <template v-if="isAuxiliaryWithCompany">
      <q-expansion-item ref="planning" v-model="activeRoutes.planning.open" label="Planning">
        <ni-menu-item name="auxiliary agenda" icon="event" label="Le mien" />
        <ni-menu-item name="auxiliaries planning" icon="face" label="Auxiliaires" />
        <ni-menu-item name="customers planning" icon="people" label="Bénéficiaires" />
      </q-expansion-item>
      <q-separator />
      <q-expansion-item ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
        <ni-menu-item name="profile customers" :params="{ id: loggedUser._id }" icon="contacts" label="Fiches" />
        <ni-menu-item name="customers fundings monitoring" icon="view_headline" label="Suivi des plans d'aide" />
      </q-expansion-item>
      <q-separator />
    </template>
    <q-expansion-item ref="administrative" v-model="activeRoutes.administrative.open" label="Administratif">
      <ni-menu-item v-if="isAuxiliaryWithCompany" name="auxiliary personal info" :params="{ id: loggedUser._id }" icon="person"
        label="Infos personnelles" />
      <ni-menu-item name="profile salaries" :params="{ id: loggedUser._id }" icon="layers" label="Paie" />
      <ni-menu-item v-if="isAuxiliaryWithCompany" name="profile docs" :params="{ id: loggedUser._id }" icon="insert_drive_file" label="Documents" />
      <ni-menu-item name="profile contracts" icon="description" label="Contrats" />
    </q-expansion-item>
    <template v-if="isAuxiliaryWithCompany">
      <q-separator />
      <q-expansion-item ref="teams" v-model="activeRoutes.teams.open" label="Équipes">
        <ni-menu-item name="teams directory" :params="{ id: loggedUser._id }" icon="contacts" label="Répertoire" />
        <ni-menu-item name="dashboard" icon="dashboard" label="Tableau de bord" />
      </q-expansion-item>
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
        teams: { open: false },
      },
      interfaceType: CLIENT,
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    ...mapGetters({ clientRole: 'main/clientRole' }),
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
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
