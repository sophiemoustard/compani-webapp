<template>
  <q-card class="container">
    <div class="row justify-between items-start">
      <div class="column justify-between flex-start" style="max-width: 80%">
        <div class="infos" v-if="repetition.type === INTERVENTION">{{ getLastVersionServiceName }}</div>
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
      <ni-button v-if="visible" icon="delete" color="copper-grey-500" @click="$emit('button-click', $event)" />
      </div>
  </q-card>
</template>
<script>
import { useMeta } from 'quasar';
import { computed } from 'vue';
import { toRefs } from 'vue-demi';
import { get } from 'lodash';
import moment from '@helpers/moment';
import { formatHoursWithMinutes } from '@helpers/date';
import { formatIdentity, getLastVersion } from '@helpers/utils';
import Button from '@components/Button';
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
  components: {
    'ni-button': Button,
  },
  props: {
    repetition: { type: Object, default: () => ({}) },
    visible: { type: Boolean, default: true },
  },
  emits: ['button-click'],
  setup (props) {
    const metaInfo = { title: 'Gestion des répétitions' };
    useMeta(metaInfo);
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

    const getLastVersionServiceName = computed(() => {
      const subscriptions = get(repetition.value, 'customer.subscriptions');
      const matchingSubscription = subscriptions.filter(sub => sub._id === get(repetition.value, 'subscription'))[0];
      const versions = get(matchingSubscription, 'service.versions');

      return getLastVersion(versions, 'createdAt').name;
    });

    return {
      // Data
      INTERVENTION,
      INTERNAL_HOUR,
      UNAVAILABILITY,
      EVENT_TYPES,
      // Computed
      getRepetitionInfos,
      getRepetitionStartDate,
      getLastVersionServiceName,
      // Methods
      formatIdentity,
      get,
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
