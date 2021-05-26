<template>
  <div class="header">
    <div class="flex-row q-mb-md items-center">
      <ni-button class="q-mr-md" icon="arrow_back" color="primary" @click="$router.go(-1)" />
      <h4 class="ellipsis">{{ title }}</h4>
      <ni-button class="q-ml-sm" color="primary" icon="date_range" @click="goToPlanning" />
    </div>
    <div class="row profile-info column">
      <div class="row items-center">
        <div :class="getDotClass(status)" />
        <div>{{ STATUS_TYPES[status] }}</div>
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
import { formatDate, dateDiff, formatDateDiff } from '@helpers/date';
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
      STATUS_TYPES,
      get,
    };
  },
  computed: {
    ...mapState('customer', ['customer']),
    status () {
      if (this.customer.archivedAt) return ARCHIVED;
      if (this.customer.stoppedAt) return STOPPED;

      return ACTIVATED;
    },
    statusDate () {
      switch (this.status) {
        case ACTIVATED: return formatDate(this.customer.createdAt);
        case STOPPED: return formatDate(this.customer.stoppedAt);
        case ARCHIVED: return formatDate(this.customer.archivedAt);
        default: return 'N/A';
      }
    },
    relativeStatusDate () {
      switch (this.status) {
        case ACTIVATED: return formatDateDiff(dateDiff(this.customer.createdAt, new Date()));
        case STOPPED: return formatDateDiff(dateDiff(this.customer.stoppedAt, new Date()));
        case ARCHIVED: return formatDateDiff(dateDiff(this.customer.archivedAt, new Date()));
        default: return '';
      }
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
    getDotClass (value) {
      return {
        'dot dot-active': value === ACTIVATED,
        'dot dot-stopped': value === STOPPED,
        'dot dot-archived': value === ARCHIVED,
      };
    },
  },
};
</script>

<style lang="stylus" scoped>
  .column
    flex-direction: column
</style>
