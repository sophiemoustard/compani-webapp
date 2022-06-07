<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Historique du financement <span class="text-weight-bold">{{ funding.thirdPartyPayer.name }}</span>
    </template>
    <ni-funding-grid-table :data="funding.versions" :columns="fundingsColumns" :visible-columns="visibleColumns" />
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import FundingGridTable from 'src/modules/client/components/table/FundingGridTable';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { FIXED } from '@data/constants';

export default {
  name: 'FundingHistoryModal',
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
        ? ['startDate', 'endDate', 'amountTTC', 'careDays']
        : ['startDate', 'endDate', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays'];

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
