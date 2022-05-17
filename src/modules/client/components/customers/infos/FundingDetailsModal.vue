<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Détail du financement <span class="text-weight-bold">{{ funding.thirdPartyPayer.name }}</span>
    </template>
    <ni-funding-grid-table :data="[funding]" :columns="fundingsColumns" :visible-columns="visibleColumns" />
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
    modelValue: { type: Boolean, default: false },
    funding: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-funding-grid-table': FundingGridTable,
  },
  mixins: [fundingMixin],
  emits: ['hide', 'update:model-value'],
  computed: {
    visibleColumns () {
      const visibleColumns = this.funding.nature === FIXED
        ? ['frequency', 'amountTTC', 'careDays', 'subscription']
        : ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];

      if (this.funding.versions.some(version => version.fundingPlanId)) visibleColumns.push('fundingPlanId');

      return visibleColumns;
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
  },
};
</script>
