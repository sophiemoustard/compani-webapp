<template>
  <div class="header">
    <div class="row col-xs-12 q-mb-md items-center">
      <ni-button class="q-mr-md" icon="arrow_back" color="primary" @click="$router.go(-1)" />
      <h4>{{ customer.identity.firstname }} {{ customer.identity.lastname }}</h4>
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
        <q-btn round flat :disable="deletionDisabled" icon="delete" color="grey" size="0px"
          @click="validateCustomerDeletion" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Customers from '@api/Customers';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export default {
  name: 'ProfileHeader',
  components: {
    'ni-button': Button,
  },
  computed: {
    ...mapState('customer', ['customer']),
    deletionDisabled () {
      return !!this.customer.firstIntervention;
    },
    isPlanningRouterDisable () {
      return !this.customer.firstIntervention;
    },
    userActivity () {
      return {
        status: this.customer.firstIntervention ? 'Client' : 'Prospect',
        active: !!this.customer.firstIntervention,
      };
    },
    userStartDate () {
      if (this.customer.createdAt) return this.$moment(this.customer.createdAt).format('DD/MM/YY');
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return this.$moment(this.userStartDate, 'DD/MM/YY').toNow(true);
      return '';
    },
  },
  methods: {
    goToPlanning () {
      this.$router.push({ name: 'ni planning customers', params: { targetedCustomer: this.customer } });
    },
    async deleteCustomer () {
      try {
        await Customers.remove(this.customer._id);
        NotifyPositive('Bénéficiaire supprimé.');
        this.$router.push({ name: 'ni customers' });
      } catch (e) {
        console.error(e);
        if (e.status === 403) NotifyNegative('Vous ne pouvez pas supprimer ce bénéficiaire.');
        if (e.msg) NotifyNegative('Erreur lors de la suppression du bénéficiaire.');
      }
    },
    validateCustomerDeletion () {
      if (this.deletionDisabled) return;
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Confirmez-vous la suppression ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCustomer)
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
  },
};
</script>

<style lang="stylus" scoped>
  .column
    flex-direction: column
</style>
