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

export default {
  name: 'CustomerNoteCell',
  props: {
    note: { type: Object, required: true },
  },
  computed: {
    lastHistoryMessage () {
      if (!get(this.note, 'histories.length')) return '';
      const lastHistory = this.note.histories[this.note.histories.length - 1];
      const name = `${lastHistory.createdBy.identity.firstname} ${lastHistory.createdBy.identity.lastname}`;

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

<style lang="stylus" scoped>
  .lastHistory
    color: $grey-800
    font-size: 12px
</style>
