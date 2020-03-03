<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts-card v-if="contracts" :contracts="contracts" :user="auxiliary" :columns="contractVisibleColumns"
      @refresh="refreshContracts" :person-key="AUXILIARY" @refreshWithTimeout="refreshContractsWithTimeout" />
  </q-page>
</template>

<script>
import Contracts from '@api/Contracts';
import { AUXILIARY } from '@data/constants';
import ContractsCard from 'src/modules/client/components/contracts/ContractsCard';
import { contractMixin } from 'src/modules/client/mixins/contractMixin.js';

export default {
  mixins: [contractMixin],
  components: {
    'ni-contracts-card': ContractsCard,
  },
  metaInfo: { title: 'Contrats' },
  data () {
    return {
      AUXILIARY,
      contracts: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
    }
  },
  computed: {
    auxiliary () {
      return this.$store.getters['current/user'];
    },
  },
  async mounted () {
    await this.refreshContracts();
  },
  methods: {
    async refreshContracts () {
      try {
        const contracts = await Contracts.list({ user: this.auxiliary._id });
        this.contracts = contracts;
      } catch (e) {
        this.contracts = [];
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
}
</script>
