<template>
  <q-card class="container">
    <div class="column justify-between flex-start">
        <div class="infos" v-if="repetition.type === INTERVENTION">{{ getLastVersionServiceName() }}</div>
        <div class="infos" v-else-if="repetition.type === INTERNAL_HOUR">
          {{ get(repetition, 'internalHour.name') }}
        </div>
        <div class="infos" v-else>{{ EVENT_TYPES.find(type => type.value === UNAVAILABILITY).label }}</div>
        <div class="bold-infos q-pt-sm">{{ getRepetitionInfos }}</div>
        <div class="infos q-pb-sm">{{ getRepetitionStartDate }}</div>
        <div v-if="repetition.type === INTERVENTION" class="customer">
          Chez {{ formatIdentity(get(repetition, 'customer.identity'), 'FL') }}
        </div>
    </div>
  </q-card>
</template>
<script>
import { computed } from 'vue';
import { toRefs } from 'vue-demi';
import { get } from 'lodash';
import moment from '@helpers/moment';
import { formatHoursWithMinutes } from '@helpers/date';
import { formatIdentity, getLastVersion } from '@helpers/utils';
import {
  REPETITION_FREQUENCIES,
  EVERY_TWO_WEEKS,
  EVERY_WEEK,
  INTERVENTION,
  INTERNAL_HOUR,
  UNAVAILABILITY,
  EVENT_TYPES,
} from '@data/constants';

export default {
  name: 'RepetitionCell',
  props: {
    repetition: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { repetition } = toRefs(props);
    const oneWeekRepetitionLabel = computed(() => `Tous les
      ${moment(get(repetition.value, 'startDate')).format('dddd')}s`);
    const twoWeeksRepetitionLabel = computed(() => `Le ${moment(get(repetition.value, 'startDate')).format('dddd')}
      une semaine sur deux`);
    const options = computed(() => REPETITION_FREQUENCIES.concat([
      { label: oneWeekRepetitionLabel.value, value: EVERY_WEEK },
      { label: twoWeeksRepetitionLabel.value, value: EVERY_TWO_WEEKS },
    ]));

    const getRepetitionFrequency = computed(() => options.value
      .find(opt => opt.value === get(repetition.value, 'frequency')).label);

    const getRepetitionInfos = computed(() => {
      const { startDate, endDate } = repetition.value;

      return `${formatHoursWithMinutes(startDate)} - ${formatHoursWithMinutes(endDate)} 
        ${getRepetitionFrequency.value}`;
    });

    const getRepetitionStartDate = computed(() => {
      const { startDate } = repetition.value;

      return `à partir du ${moment(startDate).format('DD/MM/YYYY')}`;
    });

    const getLastVersionServiceName = () => {
      const subscriptions = get(repetition.value, 'customer.subscriptions');
      const matchingSubscription = subscriptions.filter(sub => sub._id === get(repetition.value, 'subscription'))[0];
      const versions = get(matchingSubscription, 'service.versions');

      return getLastVersion(versions, 'createdAt').name;
    };

    return {
      // Data
      INTERVENTION,
      INTERNAL_HOUR,
      UNAVAILABILITY,
      EVENT_TYPES,
      // Computed
      getRepetitionInfos,
      getRepetitionStartDate,
      // Methods
      formatIdentity,
      get,
      getLastVersionServiceName,
    };
  },
};
</script>
<style lang="sass" scoped>
.container
  background-color: $copper-grey-100
  margin: 0px 0px 16px 0px
  padding: 16px
.infos
  color: $copper-grey-700
  size: 14px
.bold-infos
  color: $copper-grey-900
  font-weight: bold
  size: 16px
.customer
  color: $copper-grey-700
  size: 16px
</style>
