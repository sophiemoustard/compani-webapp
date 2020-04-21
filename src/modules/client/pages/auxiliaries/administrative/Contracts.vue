<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts-card v-if="contracts" :contracts="contracts" :user="loggedUser" :columns="contractsVisibleColumns"
      @refresh="refreshContracts" :person-key="AUXILIARY" @refreshWithTimeout="refreshContractsWithTimeout"
      :loading-contracts="loading" />
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
      contractsVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
      loading: false,
    }
  },
  async mounted () {
    await this.refreshContracts();
  },
  methods: {
    async refreshContracts () {
      try {
        this.loading = true;
        const contracts = await Contracts.list({ user: this.loggedUser._id });
        this.contracts = contracts;
      } catch (e) {
        this.contracts = [];
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
}
</script>
