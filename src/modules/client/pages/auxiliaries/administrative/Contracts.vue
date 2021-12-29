<template>
  <q-page padding class="client-background">
    <ni-title-header title="Contrats" class="q-mb-xl" />
    <ni-contracts-cell v-if="contracts" :contracts="contracts" :user="loggedUser" :columns="contractsVisibleColumns"
      @refresh="refreshContracts" :person-key="AUXILIARY" @refresh-with-timeout="refreshContractsWithTimeout"
      :loading-contracts="loading" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import Contracts from '@api/Contracts';
import TitleHeader from '@components/TitleHeader';
import { AUXILIARY } from '@data/constants';
import ContractsCell from 'src/modules/client/components/contracts/ContractsCell';
import { contractMixin } from 'src/modules/client/mixins/contractMixin';

const metaInfo = { title: 'Contrats' };

export default {
  mixins: [contractMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-title-header': TitleHeader,
    'ni-contracts-cell': ContractsCell,
  },
  data () {
    return {
      AUXILIARY,
      contracts: [],
      contractsVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
      loading: false,
    };
  },
  async created () {
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
};
</script>
