<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <q-separator />
    <q-expansion-item ref="administrative" v-model="activeRoutes.administrative.open" label="Administratif">
      <ni-menu-item name="administrative directory" icon="contacts" label="Répertoire auxiliaires" />
      <ni-menu-item v-if="isAdmin" name="staff register" icon="view_headline" label="Registre unique du personnel" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="planning" v-model="activeRoutes.planning.open" label="Planning">
      <ni-menu-item name="auxiliaries planning" icon="date_range" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="date_range" label="Bénéficiaires" />
    </q-expansion-item>
    <q-separator />
    <q-expansion-item ref="benef" v-model="activeRoutes.benef.open" label="Bénéficiaires">
      <ni-menu-item name="customers directory" icon="contacts" label="Répertoire bénéficiaires" />
    </q-expansion-item>
    <template v-if="isAdmin">
      <q-separator />
      <q-expansion-item ref="billing" v-model="activeRoutes.billing.open" label="Facturation">
        <ni-menu-item name="to bill" icon="credit_card" label="À facturer" />
        <ni-menu-item name="credit note" icon="mdi-credit-card-refund" label="Avoirs" />
        <ni-menu-item name="clients balances" icon="mdi-scale-balance" label="Balances clients" />
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
      <q-expansion-item ref="configuration" v-model="activeRoutes.configuration.open" label="Configuration"
        :header-class="{ 'text-weight-bold': activeRoutes.configuration.highlight }">
        <ni-menu-item name="rh config" icon="settings" label="Configuration RH" />
        <ni-menu-item name="customers config" icon="settings" label="Configuration bénéficiaires" />
        <ni-menu-item name="tags config" icon="list_alt" label="Tags" />
      </q-expansion-item>
    </template>
    <q-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" />
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';
import SideMenuFooter from './SideMenuFooter.vue';
import { ADMIN } from '../../data/constants';

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
      ADMIN,
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
        billing: {
          open: false,
          highlight: false,
        },
        pay: {
          open: false,
          highlight: false,
        },
        exports: {
          open: false,
          highlight: false,
        },
        configuration: {
          open: false,
          highlight: false,
        },
      },
    };
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    isAdmin () {
      return this.user.role.name === ADMIN;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
