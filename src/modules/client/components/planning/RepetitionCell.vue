<template>
  <q-card class="container">
    <div class="column justify-between flex-start">
        <div class="text-weight-bold" v-if="repetition.type === INTERVENTION">{{ getLastVersionServiceName() }}</div>
        <div class="text-weight-bold" v-else-if="repetition.type === INTERNAL_HOUR">
          {{ get(repetition, 'internalHour.name') }}
        </div>
        <div class="text-weight-bold" v-else>Indisponibilité</div>
        <div>{{ getRepetitionInfos() }}</div>
        <div>{{ getRepetitionStartDate() }}</div>
        <div v-if="repetition.type === INTERVENTION">
          Chez {{ formatIdentity(get(repetition, 'customer.identity'), 'FL') }}
        </div>
    </div>
  </q-card>
</template>
<script>
import { toRefs } from 'vue-demi';
import { get } from 'lodash';
import moment from '@helpers/moment';
import { formatHoursWithMinutes } from '@helpers/date';
import { formatIdentity, getLastVersion } from '@helpers/utils';
import { REPETITION_FREQUENCIES, EVERY_TWO_WEEKS, EVERY_WEEK, INTERVENTION, INTERNAL_HOUR } from '@data/constants';

export default {
  name: 'RepetitionCell',
  components: {
  },
  props: {
    repetition: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { repetition } = toRefs(props);

    const getRepetitionFrequency = (startDate, frequency) => {
      const oneWeekRepetitionLabel = `Tous les ${moment(startDate).format('dddd')}s`;
      const twoWeeksRepetitionLabel = `Le ${moment(startDate).format('dddd')} une semaine sur deux`;

      const options = REPETITION_FREQUENCIES.concat([
        { label: oneWeekRepetitionLabel, value: EVERY_WEEK },
        { label: twoWeeksRepetitionLabel, value: EVERY_TWO_WEEKS },
      ]);

      return options.find(opt => opt.value === frequency).label;
    };

    const getRepetitionInfos = () => {
      const startDate = get(repetition.value, 'startDate');
      const endDate = get(repetition.value, 'endDate');
      const frequency = get(repetition.value, 'frequency');
      return `${formatHoursWithMinutes(startDate)} - ${formatHoursWithMinutes(endDate)} 
        ${getRepetitionFrequency(startDate, frequency)}`;
    };

    const getRepetitionStartDate = () => {
      const startDate = get(repetition.value, 'startDate');
      return `A partir du ${moment(startDate).format('DD/MM/YYYY')}`;
    };

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
      // Methods
      getRepetitionInfos,
      getRepetitionStartDate,
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
  padding: 8px
</style>
