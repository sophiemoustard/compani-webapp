<template>
  <q-card :class="[`${repetition.hasConflicts ? 'container-conflict' : 'container'}`]">
    <div class="row justify-between items-start">
      <div class="infos-container">
        <div class="infos" v-if="isIntervention">{{ getLastVersionServiceName }}</div>
        <div class="infos" v-else-if="isInternalHour">{{ get(repetition, 'internalHour.name') }}</div>
        <div class="infos" v-else>{{ EVENT_TYPES.find(type => type.value === UNAVAILABILITY).label }}</div>
        <div class="bold-infos q-pt-sm">{{ getRepetitionInfos }}</div>
        <div class="infos q-pb-sm">{{ getRepetitionStartDate }}</div>
        <div v-if="isIntervention && !isCustomer" class="customer">
          Chez {{ formatIdentity(get(repetition, 'customer.identity'), 'FL') }}
        </div>
        <div class="row q-py-xs" v-if="isIntervention && isCustomer && !get(repetition, 'sector.name')">
          <img :src="getAvatar(get(repetition, 'auxiliary.picture'))" class="avatar avatar-size">
          <div class="auxiliary q-px-sm">{{ formatIdentity(get(repetition, 'auxiliary.identity'), 'FL') }}</div>
        </div>
        <div v-if="isIntervention && isCustomer && get(repetition, 'sector.name')">
          À affecter - {{ repetition.sector.name }}
        </div>
      </div>
      <div
        :class="['row', `${repetition.hasConflicts || repetition.hasDuplicateKey ? 'button-container' : ''}`, 'flex']">
        <div v-if="repetition.hasConflicts" class="row conflict-container">
          <div class="dot dot-orange dot-margin" />
          <div>Conflit</div>
        </div>
        <div v-if="repetition.hasDuplicateKey" class="row doublon-container">
          <div class="dot dot-grey dot-margin" />
          <div>Doublon</div>
        </div>
        <ni-button v-if="canDelete" icon="delete" color="copper-grey-500" @click="deleteRepetition" />
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
import Button from '@components/Button';
import {
  REPETITION_FREQUENCIES,
  EVERY_TWO_WEEKS,
  EVERY_WEEK,
  INTERVENTION,
  INTERNAL_HOUR,
  UNAVAILABILITY,
  EVENT_TYPES,
  DEFAULT_AVATAR,
  CUSTOMER,
} from '@data/constants';

export default {
  name: 'RepetitionCell',
  components: {
    'ni-button': Button,
  },
  props: {
    repetition: { type: Object, default: () => ({}) },
    canDelete: { type: Boolean, default: true },
    personType: { type: String, default: '' },
  },
  emits: ['delete'],
  setup (props, { emit }) {
    const { repetition, personType } = toRefs(props);

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

    const deleteRepetition = () => emit('delete');

    const getAvatar = picture => get(picture, 'link') || DEFAULT_AVATAR;

    const isIntervention = computed(() => get(repetition.value, 'type') === INTERVENTION);

    const isInternalHour = computed(() => get(repetition.value, 'type') === INTERNAL_HOUR);

    const isCustomer = computed(() => personType.value === CUSTOMER);

    return {
      // Data
      UNAVAILABILITY,
      EVENT_TYPES,
      // Computed
      getRepetitionInfos,
      getRepetitionStartDate,
      getLastVersionServiceName,
      isIntervention,
      isInternalHour,
      isCustomer,
      // Methods
      formatIdentity,
      get,
      deleteRepetition,
      getAvatar,
    };
  },
};
</script>
<style lang="sass" scoped>
.container
  background-color: $copper-grey-100
  padding: 16px
  &-conflict
    background-color: $orange-100
    padding: 16px
.infos-container
  max-width: 80%
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
.auxiliary
  size: 16px
.avatar-size
  height: 24px
  width: 24px
.conflict-container
  color: $orange-500
  align-items: center
  justify-content: space-around
  font-size: 14px
  margin: 0px 16px 0px 0px
.doublon-container
  color: $copper-grey-500
  align-items: center
  justify-content: space-around
  font-size: 14px
  margin: 0px 16px 0px 0px
.dot-margin
  margin: 0px 4px 0px 0px
.button-container
  @media screen and (max-width: $breakpoint-sm-max)
    width: 100%
    justify-content: space-between
</style>
