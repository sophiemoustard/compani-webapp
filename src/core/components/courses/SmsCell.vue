<template>
  <div>
    <q-card class="container">
      <div class="row justify-between items-center" @click="showDetails">
        <div>
          <div class="text-weight-bold">SMS de {{ getHistoryType(history.type) }}</div>
          <div>envoyé {{ getDate(history.date) }} par {{ formatIdentity(history.sender.identity, 'FL') }}</div>
        </div>
        <q-icon size="24px" :name="isExpand ? 'expand_less' : 'expand_more'" />
      </div>
      <div v-if="isExpand" class="q-mt-md">{{ history.message }}</div>
    </q-card>
  </div>
</template>

<script>

import { toRefs } from 'vue';
import { dateDiff, formatDateDiff, formatDate } from '@helpers/date';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'SmsCell',
  props: {
    history: { type: Object, default: () => ({}) },
    messageTypeOptions: { type: Array, default: () => ([]) },
    isExpand: { type: Boolean, default: false },
  },
  emits: ['show-details'],
  setup (props, { emit }) {
    const { messageTypeOptions, history } = toRefs(props);

    const getHistoryType = type => messageTypeOptions.value.find(option => option.value === type).label.toLowerCase();

    const getDate = (date) => {
      const dateDifference = dateDiff(Date.now(), date);
      const millisecondsToDays = 1000 * 60 * 60 * 24;
      if ((dateDifference / millisecondsToDays) > 15) return `le ${formatDate(date)}`;

      return `il y a ${formatDateDiff(dateDifference)}`;
    };

    const showDetails = () => {
      emit('show-details', history.value._id);
    };

    return {
      // Methods
      getHistoryType,
      getDate,
      formatIdentity,
      showDetails,
    };
  },
};
</script>

<style lang="sass" scoped>
div
  white-space: pre-wrap
.container
  background-color: $copper-grey-50
  margin: 16px 0px
  padding: 8px
</style>
