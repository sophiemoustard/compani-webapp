<template>
  <q-card class="cell-container text-copper-grey-500">
    <div class="row cell-header q-mb-md">
      <div class="text-weight-bold">{{ subscription.service.name }}</div>
      <ni-button icon="history" @click="showHistory(subscription._id)" data-cy="show-subscription-history"
        color="copper-grey-500" />
    </div>
    <div v-if="subscription.service.nature === HOURLY" class="q-mb-md">
      Prix horaire (TTC) :
      <span class="text-weight-bold text-copper-grey-700">{{ formatPrice(subscription.unitTTCRate) }} / heure</span>
    </div>
    <div v-else class="q-mb-md">
      Coût forfaitaire (TTC) :
      <span class="text-weight-bold text-copper-grey-700">
        {{ formatPrice(subscription.unitTTCRate) }} / intervention
      </span>
    </div>
    <div v-if="get(subscription, 'service.billingItems.length')">
      Prix par intervention (TTC) :
      <span class="text-weight-bold text-copper-grey-700">
        {{ formatPrice(getBillingItemsPrice()) }} / intervention
      </span>
      <div class="text-italic q-mb-md" style="font-size: 12px">Ce prix correspond à : {{ getBillingItemsName() }}</div>
    </div>
    <div class="bg-copper-grey-100 text-copper-grey-700 weekly-infos">
      <div>
        Coût estimé pour une semaine :
        <span class="text-weight-bold">{{ formatPrice(weeklyRate.total) }} / semaine</span>
        <span v-if="weeklyRate.totalSurcharge"> (dont {{ formatPrice(weeklyRate.totalSurcharge) }} de majoration)</span>
      </div>
      <div class="text-italic" style="font-size: 14px">
        <div>Estimation sur base de : </div>
        <ul>
          <li v-if="subscription.weeklyHours">
            {{ subscription.weeklyHours }}h d'intervention par semaine
            <span v-if="getSurchargedHours()">(dont majorées : {{ getSurchargedHours() }})</span>
          </li>
          <li v-if="subscription.weeklyCount">
            {{ formatQuantity('intervention', subscription.weeklyCount) }} par semaine
          </li>
          <li v-if="fundings.length">
            Prise en charge par {{ fundings[0].thirdPartyPayer.name }} : {{ formatPrice(weeklyRate.fundingReduction) }}
            <span class="cursor-pointer text-copper-400 funding-details"
              @click="showSubscriptionFundings(subscription._id)">
              (voir détails)
            </span>
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
import { formatQuantity, formatPrice } from '@helpers/utils';
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
    const getBillingItemsPrice = () => props.subscription.service.billingItems
      .reduce((acc, bi) => (acc += bi.defaultUnitAmount), 0);

    const getBillingItemsName = () => {
      const billingItemsName = props.subscription.service.billingItems.reduce((acc, bi) => (acc += `${bi.name}, `), '');
      return billingItemsName.slice(0, -2);
    };

    const getSurchargedHours = () => {
      let surchargedHours = '';
      if (props.subscription.saturdays) surchargedHours += `${props.subscription.saturdays}h le samedi, `;
      if (props.subscription.sundays) surchargedHours += `${props.subscription.sundays}h le dimanche, `;
      if (props.subscription.evenings) surchargedHours += `${props.subscription.evenings}h en soirée, `;

      return surchargedHours.slice(0, -2);
    };

    const showHistory = (id) => { context.emit('showHistory', id); };

    const showSubscriptionFundings = (id) => { context.emit('showSubscriptionFundings', id); };

    return {
      // Data
      HOURLY,
      // Methods
      getBillingItemsPrice,
      getBillingItemsName,
      showHistory,
      showSubscriptionFundings,
      getSurchargedHours,
      get,
      formatQuantity,
      formatPrice,
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
  .funding-details
    text-decoration: underline
</style>
