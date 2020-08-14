<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Détail du financement <span class="text-weight-bold">{{ selected.thirdPartyPayer.name }}</span>
    </template>
    <ni-funding-grid-table :data="fundingDetailsData" :columns="fundingsColumns"
      :visible-columns="fundingDetailsVisibleColumns" />
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import FundingGridTable from 'src/modules/client/components/table/FundingGridTable';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { FIXED } from '@data/constants.js';

export default {
  name: 'FundingDetailsModal',
  props: {
    value: { type: Boolean, default: false },
    selected: { type: Object, default: () => {} },
    fundingDetailsData: { type: Array, default: () => [] },
  },
  components: {
    'ni-modal': Modal,
    'ni-funding-grid-table': FundingGridTable,
  },
  mixins: [
    fundingMixin,
  ],
  computed: {
    fundingDetailsVisibleColumns () {
      return this.selectedFunding.nature === FIXED
        ? ['frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'subscription']
        : ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
  },
}
</script>
