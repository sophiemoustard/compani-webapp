<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" :columns="contractVisibleColumns"
      @refresh="refreshContracts" :person-key="AUXILIARY" @refreshWithTimeout="refreshContractsWithTimeout" />
  </q-page>
</template>

<script>
import { contractMixin } from '../../../mixins/contractMixin.js';
import NiContracts from '../../../components/contracts/Contracts';
import { AUXILIARY } from '../../../data/constants';

export default {
  mixins: [contractMixin],
  components: {
    NiContracts,
  },
  metaInfo: {
    title: 'Contrats',
  },
  data () {
    return {
      AUXILIARY,
      contracts: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    await this.refreshContracts();
  },
  methods: {
    async refreshContracts () {
      try {
        const contracts = await this.$contracts.list({ user: this.getUser._id });
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

<style lang="stylus" scoped>
</style>
