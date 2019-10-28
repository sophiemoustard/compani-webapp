<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" :columns="contractVisibleColumns"
      @refresh="refreshContracts" :person-key="CUSTOMER" @refreshWithTimeout="refreshContractsWithTimeout" />
  </q-page>
</template>

<script>
import { contractMixin } from '../../mixins/contractMixin.js';
import Contracts from '../../components/contracts/Contracts';
import { CUSTOMER } from '../../data/constants';

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
    getUser () {
      const helper = this.$store.getters['main/user'];
      return helper && helper.customers && helper.customers.length > 0 ? helper.customers[0] : {};
    },
  },
  async mounted () {
    await this.refreshContracts({ customer: this.getUser._id });
  },
  methods: {
    async refreshContracts () {
      try {
        this.contracts = await this.$contracts.list({ customer: this.getUser._id });
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
