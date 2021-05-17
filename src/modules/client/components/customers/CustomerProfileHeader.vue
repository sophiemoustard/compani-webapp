<template>
  <div class="header">
    <div class="flex-row q-mb-md items-center">
      <ni-button class="q-mr-md" icon="arrow_back" color="primary" @click="$router.go(-1)" />
      <h4 class="ellipsis">{{ title }}</h4>
      <ni-button class="q-ml-sm" color="primary" icon="date_range" @click="goToPlanning" />
    </div>
    <div class="row profile-info column">
      <div class="row items-center">
        <div :class="{'dot dot-active': get(customer, 'status.value') === ACTIVATED,
          'dot dot-stopped': get(customer, 'status.value') === STOPPED,
          'dot dot-archived': get(customer, 'status.value') === ARCHIVED }" />
        <div>{{ STATUS_TYPES[get(customer, 'status.value')] }}</div>
      </div>
      <div class="row items-center">
        <q-icon name="restore" class="q-mr-md" size="1rem" />
        <div class="q-mr-md">Depuis le {{ statusDate }} ({{ relativeStatusDate }})</div>
        <ni-button icon="delete" @click="validateCustomerDeletion" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import Customers from '@api/Customers';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import moment from '@helpers/moment';
import { ACTIVATED, STOPPED, ARCHIVED, STATUS_TYPES } from '@data/constants';

export default {
  name: 'ProfileHeader',
  props: {
    title: { type: String, required: true },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      ACTIVATED,
      STOPPED,
      ARCHIVED,
      STATUS_TYPES,
      get,
    };
  },
  computed: {
    ...mapState('customer', ['customer']),
    statusDate () {
      switch (get(this.customer, 'status.value')) {
        case ACTIVATED: return moment(this.customer.status.activatedAt).format('DD/MM/YY');
        case STOPPED: return moment(this.customer.status.stoppedAt).format('DD/MM/YY');
        case ARCHIVED: return moment(this.customer.status.archivedAt).format('DD/MM/YY');
        default: return 'N/A';
      }
    },
    relativeStatusDate () {
      if (this.statusDate !== 'N/A') return moment(this.statusDate, 'DD/MM/YY').toNow(true);
      return '';
    },
  },
  methods: {
    goToPlanning () {
      if (this.customer.subscriptions.length) {
        return this.$router.push({ name: 'ni planning customers', params: { targetedCustomer: this.customer } });
      }

      return NotifyWarning('Ce bénéficiaire n\'a pas de souscription.');
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
      if (this.customer.firstIntervention) return NotifyWarning('Ce bénéficiaire est lié à des interventions.');
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Confirmez-vous la suppression ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCustomer)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>

<style lang="stylus" scoped>
  .column
    flex-direction: column
</style>
