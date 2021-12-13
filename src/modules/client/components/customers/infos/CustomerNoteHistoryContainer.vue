<template>
  <div class="q-mb-lg">
    <q-separator class="q-my-lg" />
    <div class="flex-row items-center justify-between">
      <div class="flex-row items-center">
        <q-icon size="sm" name="history" class="q-mr-sm" color="copper-grey-500" />
        <div class="history-list-title text-weight-bold">
          Historique ({{ formatQuantity('modification', histories.length) }})
        </div>
      </div>
      <ni-button :label="historyButtonLabel" color="copper-grey-800" class="bg-copper-grey-100"
        @click="toggleHistory" />
    </div>
    <div v-if="displayHistory" class="q-mt-sm">
      <customer-note-history v-for="history in histories" :key="history._id" :history="history" />
    </div>
  </div>
</template>

<script>
import Button from '@components/Button';
import { formatQuantity } from '@helpers/utils';
import CustomerNoteHistory from 'src/modules/client/components/customers/infos/CustomerNoteHistory';

export default {
  name: 'CustomerNoteHistoryContainer',
  props: {
    histories: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
    'customer-note-history': CustomerNoteHistory,
  },
  data () {
    return {
      displayHistory: false,
    };
  },
  computed: {
    historyButtonLabel () {
      return this.displayHistory ? 'Masquer les détails' : 'Afficher les détails';
    },
  },
  methods: {
    formatQuantity,
    toggleHistory () {
      this.displayHistory = !this.displayHistory;
    },
  },
};
</script>

<style lang="sass" scoped>
  .history-list-title
    font-size: 14px
</style>
