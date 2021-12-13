<template>
  <div class="q-py-sm q-px-md cursor-pointer" @click="click">
    <div class="text-primary ellipsis">{{ note.title }}</div>
    <div v-if="lastHistoryMessage" class="lastHistory">{{ lastHistoryMessage }}</div>
    <div class="ellipsis q-mt-sm">{{ note.description }}</div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { formatDate } from '@helpers/date';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'CustomerNoteCell',
  props: {
    note: { type: Object, required: true },
  },
  computed: {
    lastHistoryMessage () {
      if (!get(this.note, 'histories.length')) return '';

      const lastHistory = this.note.histories[0];
      const name = `${formatIdentity(lastHistory.createdBy.identity, 'FL')}`;

      return `dernière modification le ${formatDate(lastHistory.createdAt)} par ${name}`;
    },
  },
  methods: {
    get,
    formatDate,
    click () {
      this.$emit('openEditedNoteModal', this.note);
    },
  },
};
</script>

<style lang="sass" scoped>
.lastHistory
  color: $copper-grey-500
  font-size: 12px
</style>
