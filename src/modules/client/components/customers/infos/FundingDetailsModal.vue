<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Détail du financement <span class="text-weight-bold">{{ funding.thirdPartyPayer.name }}</span>
    </template>
    <ni-funding-grid-table :data="[funding]" :columns="fundingsColumns"
      :visible-columns="visibleColumns" />
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import FundingGridTable from 'src/modules/client/components/table/FundingGridTable';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { FIXED } from '@data/constants';

export default {
  name: 'FundingDetailsModal',
  props: {
    value: { type: Boolean, default: false },
    funding: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-funding-grid-table': FundingGridTable,
  },
  mixins: [
    fundingMixin,
  ],
  computed: {
    visibleColumns () {
      const visibleColumns = this.funding.nature === FIXED
        ? ['frequency', 'amountTTC', 'careDays', 'subscription']
        : ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];

      for (const version of this.funding.versions) {
        if (version.fundingPlanId) visibleColumns.push('fundingPlanId');
      }

      return visibleColumns;
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
  },
};
</script>
