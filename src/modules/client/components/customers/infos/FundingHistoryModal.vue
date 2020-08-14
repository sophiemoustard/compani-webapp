<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Historique du financement <span class="text-weight-bold">{{ selected.thirdPartyPayer.name }}</span>
    </template>
    <ni-funding-grid-table :data="selected.versions" :columns="fundingsColumns"
      :visible-columns="fundingHistoriesVisibleColumns" />
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
  },
  components: {
    'ni-modal': Modal,
    'ni-funding-grid-table': FundingGridTable,
  },
  mixins: [
    fundingMixin,
  ],
  computed: {
    fundingHistoriesVisibleColumns () {
      return this.selectedFunding.nature === FIXED
        ? ['startDate', 'endDate', 'amountTTC', 'customerParticipationRate', 'careDays']
        : ['startDate', 'endDate', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays'];
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
  },
}
</script>
