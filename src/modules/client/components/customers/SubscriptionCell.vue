<template>
  <q-card class="cell-container text-copper-grey-500">
    <div class="row cell-header q-mb-md">
      <div class="text-weight-bold">{{ subscription.service.name }}</div>
      <div>
        <ni-button icon="history" @click="showHistory(subscription._id)" data-cy="show-subscription-history" />
        <ni-button icon="mdi-calculator" :disable="!fundings.length" @click="showSubscriptionFundings"
          data-cy="show-fundings-history" />
      </div>
    </div>
    <div v-if="subscription.service.nature === HOURLY" class="q-mb-md">
      Prix horaire (TTC) :
      <span class="text-weight-bold text-copper-grey-700">{{ subscription.unitTTCRate }} € / heure</span>
    </div>
    <div v-else class="q-mb-md">
      Prix forfaitaire (TTC) :
      <span class="text-weight-bold text-copper-grey-700">{{ subscription.unitTTCRate }} € / intervention</span>
    </div>
    <div v-if="get(subscription, 'service.billingItems.length')">
      Prix par intervention (TTC) :
      <span class="text-weight-bold text-copper-grey-700">{{ getBillingItemsPrice() }} € / intervention</span>
      <div class="text-italic q-mb-md" style="font-size: 12px">Ce prix correspond à : {{ getBillingItemsNames() }}</div>
    </div>
    <div class="bg-copper-grey-100 text-copper-grey-700 weekly-infos">
      <div>
        Coût estimé pour une semaine :
        <span class="text-weight-bold">{{ formatNumber(weeklyRate.total) }} € / semaine</span>
        <span v-if="weeklyRate.totalSurcharge"> (dont {{ weeklyRate.totalSurcharge }} € de majoration)</span>
      </div>
      <div class="text-italic" style="font-size: 14px">
        <div>Estimation sur base de : </div>
        <ul>
          <li v-if="subscription.weeklyHours">
            {{ subscription.weeklyHours }} h d'intervention par semaine
            <span v-if="getSurchargesHours()">(dont majorées : {{ getSurchargesHours() }})</span>
          </li>
          <li v-if="subscription.weeklyCount">
            {{ formatQuantity('intervention', subscription.weeklyCount) }} par semaine
          </li>
        </ul>
      </div>
    </div>
  </q-card>
</template>

<script>
import get from 'lodash/get';
import Button from '@components/Button';
import { HOURLY } from '@data/constants';
import { formatQuantity } from '@helpers/utils';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';

export default {
  name: 'SubscriptionCell',
  props: {
    subscription: { type: Object, required: true },
    fundings: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-button': Button,
  },
  mixins: [subscriptionMixin],
  emits: ['showHistory', 'showSubscriptionFundings'],
  computed: {
    weeklyRate () {
      return this.computeWeeklyRate(this.subscription, this.getMatchingFunding(this.subscription));
    },
  },
  setup (props, context) {
    const getBillingItemsPrice = () => {
      if (!get(props.subscription, 'service.billingItems.length')) return 'sku';

      return props.subscription.service.billingItems.reduce((acc, bi) => (acc += bi.defaultUnitAmount), 0);
    };

    const getBillingItemsNames = () => {
      if (!get(props.subscription, 'service.billingItems.length')) return 'sku';

      const billingItemsName = props.subscription.service.billingItems.reduce((acc, bi) => (acc += `${bi.name}, `), '');
      return billingItemsName.slice(0, -2);
    };

    const getSurchargesHours = () => {
      let surchargesHours = '';
      if (props.subscription.saturdays) surchargesHours += `${props.subscription.saturdays} h le samedi, `;
      if (props.subscription.sundays) surchargesHours += `${props.subscription.sundays} h le dimanche, `;
      if (props.subscription.evenings) surchargesHours += `${props.subscription.evenings} h en soirée, `;

      return surchargesHours.slice(0, -2);
    };

    const getSubscriptionFundings = subscriptionId => this.fundings
      .filter(fund => fund.subscription._id === subscriptionId);

    const showHistory = (id) => {
      context.emit('showHistory', id);
    };

    const showSubscriptionFundings = () => {
      context.emit('showSubscriptionFundings', props.subscription);
    };

    return {
      // Data
      HOURLY,
      // Methods
      getBillingItemsPrice,
      getBillingItemsNames,
      getSubscriptionFundings,
      showHistory,
      showSubscriptionFundings,
      getSurchargesHours,
      get,
      formatQuantity,
    };
  },
};
</script>

<style lang="sass" scoped>
  .cell-container
    background: white
    width: 100%
    margin-bottom: 10px
    padding: 16px
  .cell-header
    justify-content: space-between
    align-items: center
  .weekly-infos
    border-radius: 16px !important
    padding: 16px
    > div > ul
      margin: 0
      padding-inline-start: 24px
</style>
