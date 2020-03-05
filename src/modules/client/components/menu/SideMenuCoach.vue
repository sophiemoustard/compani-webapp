<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="teams" v-model="activeRoutes.teams.open" label="Équipes">
      <ni-menu-item name="auxiliaries directory" icon="contacts" label="Répertoire auxiliaires" />
      <ni-menu-item v-if="isAdmin" name="staff register" icon="view_headline" label="Registre unique du personnel" />
      <ni-menu-item name="dashboard" icon="dashboard" label="Tableau de bord" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="planning" v-model="activeRoutes.planning.open" label="Planning">
      <ni-menu-item name="auxiliaries planning" icon="date_range" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="date_range" label="Bénéficiaires" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
      <ni-menu-item name="customers directory" icon="contacts" label="Répertoire bénéficiaires" />
      <ni-menu-item name="customers fundings monitoring" icon="view_headline" label="Suivi des plans d'aide" />
    </q-expansion-item>
    <template v-if="isAdmin">
      <q-separator />
      <q-expansion-item ref="billing" v-model="activeRoutes.billing.open" label="Facturation">
        <ni-menu-item name="to bill" icon="credit_card" label="À facturer" />
        <ni-menu-item name="credit note" icon="mdi-credit-card-refund" label="Avoirs" />
        <ni-menu-item name="clients balances" icon="mdi-scale-balance" label="Balances clients" />
        <ni-menu-item name="tpp bill slips" icon="view_headline" label="Bordereaux tiers payeurs" />
        <ni-menu-item name="debits archive" icon="mdi-archive" label="Archive prélèvements" />
      </q-expansion-item>
    </template>
    <q-separator />
    <q-expansion-item ref="pay" v-model="activeRoutes.pay.open" label="Paie">
      <ni-menu-item name="contract monitoring" icon="insert_drive_file" label="Suivi Contracts/Avenants" />
      <ni-menu-item name="absences" icon="calendar_today" label="Absences" />
      <template v-if="isAdmin">
        <ni-menu-item name="contract ends" icon="description" label="STC" />
        <ni-menu-item name="to pay" icon="euro_symbol" label="Paie mensuelle" />
      </template>
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="exports" v-model="activeRoutes.exports.open" label="Exports">
      <ni-menu-item name="data" icon="list_alt" label="Données" />
      <ni-menu-item name="history" icon="history" label="Historique" />
    </q-expansion-item>
    <template v-if="isAdmin">
      <q-separator />
      <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration">
        <ni-menu-item name="company config" icon="house" label="Configuration générale" />
        <ni-menu-item name="rh config" icon="accessibility" label="Configuration RH" />
        <ni-menu-item name="customers config" icon="settings" label="Configuration bénéficiaires" />
        <ni-menu-item name="tags config" icon="list_alt" label="Tags" />
      </q-expansion-item>
    </template>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="loggedUser._id" />
  </q-list>
</template>

<script>
import { CLIENT_ADMIN } from '@data/constants';
import SideMenuFooter from '@components/menu/SideMenuFooter';
import MenuItem from '@components/menu/MenuItem';
import { sideMenuMixin } from '@mixins/sideMenuMixin';

export default {
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      CLIENT_ADMIN,
      activeRoutes: {
        planning: { open: false },
        benef: { open: false },
        teams: { open: false },
        billing: { open: false },
        pay: { open: false },
        exports: { open: false },
        configuration: { open: false },
      },
    };
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    isAdmin () {
      return CLIENT_ADMIN === this.loggedUser.role.client.name;
    },
    loggedUser () {
      return this.$store.getters['main/loggedUser'];
    },
  },
}
</script>
