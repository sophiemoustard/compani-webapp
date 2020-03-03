<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts v-if="contracts" :contracts="contracts" :user="customer" :columns="contractVisibleColumns"
      @refresh="refreshContracts" :person-key="CUSTOMER" @refreshWithTimeout="refreshContractsWithTimeout" />
  </q-page>
</template>

<script>
import { CUSTOMER } from '@data/constants';
import { contractMixin } from 'src/modules/client/mixins/contractMixin.js';
import Contracts from 'src/modules/client/components/contracts/Contracts';

export default {
  name: 'CustomerContracts',
  metaInfo: { title: 'Contracts' },
  mixins: [contractMixin],
  components: {
    'ni-contracts': Contracts,
  },
  data () {
    return {
      CUSTOMER,
      contracts: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
    }
  },
  computed: {
    customer () {
      const helper = this.$store.getters['current/user'];
      return helper && helper.customers && helper.customers.length > 0 ? helper.customers[0] : {};
    },
  },
  async mounted () {
    await this.refreshContracts({ customer: this.customer._id });
  },
  methods: {
    async refreshContracts () {
      try {
        this.contracts = await this.$contracts.list({ customer: this.customer._id });
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
