<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="teams" v-model="activeRoutes.teams.open" label="Équipes">
      <ni-menu-item name="ni auxiliaries directory" icon="contacts" label="Répertoire auxiliaires" />
      <ni-menu-item v-if="isAdmin" name="ni auxiliaries staff register" icon="view_headline" label="Registre unique du personnel" />
      <ni-menu-item name="ni auxiliaries dashboard" icon="dashboard" label="Tableau de bord" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="planning" v-model="activeRoutes.planning.open" label="Planning">
      <ni-menu-item name="ni planning auxiliaries" icon="date_range" label="Auxiliaires" />
      <ni-menu-item name="ni planning customers" icon="date_range" label="Bénéficiaires" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
      <ni-menu-item name="ni customers directory" icon="contacts" label="Répertoire bénéficiaires" />
      <ni-menu-item name="ni customers fundings monitoring" icon="view_headline" label="Suivi des plans d'aide" />
    </q-expansion-item>
    <template v-if="isAdmin">
      <q-separator />
      <q-expansion-item ref="billing" v-model="activeRoutes.billing.open" label="Facturation">
        <ni-menu-item name="ni billing to bill" icon="credit_card" label="À facturer" />
        <ni-menu-item name="ni billing credit note" icon="mdi-credit-card-refund" label="Avoirs" />
        <ni-menu-item name="ni billing clients balances" icon="mdi-scale-balance" label="Balances clients" />
        <ni-menu-item name="ni billing tpp bill slips" icon="view_headline" label="Bordereaux tiers payeurs" />
        <ni-menu-item name="ni billing debits archive" icon="mdi-archive" label="Archive prélèvements" />
      </q-expansion-item>
    </template>
    <q-separator />
    <q-expansion-item ref="pay" v-model="activeRoutes.pay.open" label="Paie">
      <ni-menu-item name="ni pay contract monitoring" icon="insert_drive_file" label="Suivi Contracts/Avenants" />
      <ni-menu-item name="ni pay absences" icon="calendar_today" label="Absences" />
      <template v-if="isAdmin">
        <ni-menu-item name="ni pay contract ends" icon="description" label="STC" />
        <ni-menu-item name="ni pay to pay" icon="euro_symbol" label="Paie mensuelle" />
      </template>
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="exports" v-model="activeRoutes.exports.open" label="Exports">
      <ni-menu-item name="ni exports data" icon="list_alt" label="Données" />
      <ni-menu-item name="ni exports history" icon="history" label="Historique" />
    </q-expansion-item>
    <template v-if="isAdmin">
      <q-separator />
      <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration">
        <ni-menu-item name="ni config company" icon="house" label="Configuration générale" />
        <ni-menu-item name="ni config rh" icon="accessibility" label="Configuration RH" />
        <ni-menu-item name="ni config customers" icon="settings" label="Configuration bénéficiaires" />
        <ni-menu-item name="ni config coach" icon="people" label="Coachs" />
        <ni-menu-item name="ni config tags" icon="list_alt" label="Tags" />
      </q-expansion-item>
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
    ...mapGetters({ clientRole: 'main/clientRole' }),
    isAdmin () {
      return CLIENT_ADMIN === this.clientRole;
    },
  },
}
</script>
