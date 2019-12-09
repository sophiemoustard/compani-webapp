<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="planning" v-model="activeRoutes.planning.open" label="Planning">
      <ni-menu-item name="auxiliary agenda" icon="event" label="Le mien" />
      <ni-menu-item name="auxiliaries planning" icon="face" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="people" label="Bénéficiaires" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
      <ni-menu-item name="profile customers" :params="{ id: user._id }" icon="account_box" label="Fiches" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="administrative" v-model="activeRoutes.administrative.open" label="Administratif">
      <ni-menu-item name="auxiliary personal info" :params="{ id: user._id }" icon="person" label="Infos personnelles" />
      <ni-menu-item name="profile salaries" :params="{ id: user._id }" icon="layers" label="Paie" />
      <ni-menu-item name="profile docs" :params="{ id: user._id }" icon="insert_drive_file" label="Documents" />
      <ni-menu-item name="profile contracts" icon="description" label="Contrats" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="team" v-model="activeRoutes.team.open" label="Équipe">
      <ni-menu-item name="team directory" :params="{ id: user._id }" icon="group" label="Répertoire" />
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
        team: { open: false },
      },
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  methods: {
    connectToBotMessenger () {
      const token = Cookies.get('alenvi_token');
      window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
    },
  },
}
</script>
