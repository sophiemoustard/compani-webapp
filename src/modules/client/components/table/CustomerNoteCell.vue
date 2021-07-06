<template>
  <div class="q-py-sm q-px-md cursor-pointer" @click="click">
    <div class="text-primary ellipsis">{{ note.title }}</div>
    <div v-if="lastHistory" class="lastHistory q-mb-sm">
      dernière modification le {{ formatDate(get(lastHistory, 'createdAt')) }} par {{ author }}
    </div>
    <div class="ellipsis">{{ note.description }}</div>
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
    lastHistory () {
      return get(this.note, 'histories') ? this.note.histories[this.note.histories.length - 1] : null;
    },
    author () {
      return get(this.lastHistory, 'createdBy')
        ? `${this.lastHistory.createdBy.identity.firstname} ${this.lastHistory.createdBy.identity.lastname}`
        : '';
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
