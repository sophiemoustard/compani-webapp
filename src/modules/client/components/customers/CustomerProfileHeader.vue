<template>
  <div class="header">
    <div class="row col-xs-12 q-mb-md items-center">
      <q-icon class="q-mr-md cursor-pointer" size="1rem" name="arrow_back" color="primary"
        @click="$router.go(-1)" />
      <h4>{{ user.identity.firstname }} {{ user.identity.lastname }}</h4>
      <q-btn :disable="isPlanningRouterDisable" flat size="sm" color="primary" icon="date_range"
        @click="goToPlanning" />
    </div>
    <div class="row col-xs-12 profile-info column">
      <div class="row items-center">
        <div :class="['dot', userActivity.active ? 'dot-active' : 'dot-inactive']" />
        <div>{{ userActivity.status }}</div>
      </div>
      <div class="row items-center">
        <q-icon name="restore" class="q-mr-md" size="1rem" />
        <div class="q-mr-md">Depuis le {{ userStartDate }} ({{ userRelativeStartDate }})</div>
        <q-icon name="delete" color="grey" size="1rem" :disable="!!user.firstIntervention"
          @click="validateCustomerDeletion" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Customers from '@api/Customers';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export default {
  name: 'ProfileHeader',
  computed: {
    ...mapGetters({
      user: 'rh/getUserProfile',
    }),
    isPlanningRouterDisable () {
      return !this.user.firstIntervention;
    },
    userActivity () {
      return {
        status: this.user.firstIntervention ? 'Client' : 'Prospect',
        active: !!this.user.firstIntervention,
      };
    },
    userStartDate () {
      if (this.user.createdAt) return this.$moment(this.user.createdAt).format('DD/MM/YY');
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return this.$moment(this.userStartDate, 'DD/MM/YY').toNow(true);
      return '';
    },
  },
  methods: {
    goToPlanning () {
      this.$router.push({ name: 'customers planning', params: { targetedCustomer: this.user } });
    },
    async deleteCustomer () {
      try {
        await Customers.remove(this.user._id);
        NotifyPositive('Bénéficiaire supprimé.');
        this.$router.push({ name: 'customers directory' });
      } catch (e) {
        console.error(e);
        if (e.msg) NotifyNegative('Erreur lors de la suppression du bénéficiaire');
      }
    },
    validateCustomerDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Confirmez-vous la suppression ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCustomer)
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
  },
}
</script>

<style lang="stylus" scoped>
  .column
    flex-direction: column
</style>
