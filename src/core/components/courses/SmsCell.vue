<template>
  <div>
    <q-card class="container">
      <div class="row justify-between items-center cursor-pointer" @click="showDetails">
        <div>
          <div class="text-weight-bold">SMS de {{ getHistoryType }}</div>
          <div>envoyé {{ getDate }} par {{ senderIdentity }}</div>
        </div>
        <q-icon size="24px" :name="isExpanded ? 'expand_less' : 'expand_more'" />
      </div>
      <div v-if="isExpanded" class="q-mt-md">{{ history.message }}</div>
    </q-card>
  </div>
</template>

<script>

import { toRefs, computed } from 'vue';
import { dateDiff, formatDateDiff, formatDate } from '@helpers/date';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'SmsCell',
  props: {
    history: { type: Object, default: () => ({}) },
    messageTypeOptions: { type: Array, default: () => ([]) },
    isExpanded: { type: Boolean, default: false },
  },
  emits: ['show-details'],
  setup (props, { emit }) {
    const { messageTypeOptions, history } = toRefs(props);

    const getHistoryType =
      computed(() => messageTypeOptions.value.find(option => option.value === history.value.type).label.toLowerCase());

    const getDate = computed(() => {
      const dateDifference = dateDiff(Date.now(), history.value.date);
      const millisecondsToDays = 1000 * 60 * 60 * 24;
      if ((dateDifference / millisecondsToDays) > 15) return `le ${formatDate(history.value.date)}`;

      return `il y a ${formatDateDiff(dateDifference)}`;
    });

    const senderIdentity = computed(() => formatIdentity(history.value.sender.identity, 'FL'));

    const showDetails = () => {
      emit('show-details', history.value._id);
    };

    return {
      // Computed
      senderIdentity,
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
  margin: 0px 0px 16px 0px
  padding: 8px
</style>
