<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts-card v-if="contracts" :contracts="contracts" :user="customer" :columns="contractVisibleColumns"
      @refresh="refreshContracts" :person-key="CUSTOMER" @refreshWithTimeout="refreshContractsWithTimeout"
      :loading-contracts="loading" />
  </q-page>
</template>

<script>
import Contracts from '@api/Contracts';
import { CUSTOMER } from '@data/constants';
import { contractMixin } from 'src/modules/client/mixins/contractMixin.js';
import ContractsCard from 'src/modules/client/components/contracts/ContractsCard';

export default {
  name: 'CustomerContracts',
  metaInfo: { title: 'Contracts' },
  mixins: [contractMixin],
  components: {
    'ni-contracts-card': ContractsCard,
  },
  data () {
    return {
      CUSTOMER,
      contracts: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
      loading: false,
    }
  },
  computed: {
    customer () {
      const helper = this.$store.getters['main/loggedUser'];
      return helper && helper.customers && helper.customers.length > 0 ? helper.customers[0] : {};
    },
  },
  async mounted () {
    await this.refreshContracts({ customer: this.customer._id });
  },
  methods: {
    async refreshContracts () {
      try {
        this.loading = true;
        this.contracts = await Contracts.list({ customer: this.customer._id });
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
