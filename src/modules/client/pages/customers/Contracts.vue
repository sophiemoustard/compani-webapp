<template>
  <q-page padding class="client-background">
    <h4>Contrats</h4>
    <ni-contracts-cell v-if="contracts" :contracts="contracts" :user="customer" :columns="contractsVisibleColumns"
      @refresh="refreshContracts" :person-key="CUSTOMER" @refreshWithTimeout="refreshContractsWithTimeout"
      :loading-contracts="loading" />
  </q-page>
</template>

<script>
import Contracts from '@api/Contracts';
import { CUSTOMER } from '@data/constants';
import { contractMixin } from 'src/modules/client/mixins/contractMixin.js';
import ContractsCell from 'src/modules/client/components/contracts/ContractsCell';

export default {
  name: 'CustomerContracts',
  metaInfo: { title: 'Contracts' },
  mixins: [contractMixin],
  components: {
    'ni-contracts-cell': ContractsCell,
  },
  data () {
    return {
      CUSTOMER,
      contracts: [],
      contractsVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
      loading: false,
    }
  },
  computed: {
    customer () {
      return this.loggedUser && this.loggedUser.customers && this.loggedUser.customers.length > 0
        ? this.loggedUser.customers[0]
        : {};
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
}
</script>
