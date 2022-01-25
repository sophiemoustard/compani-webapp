<template>
    <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
      <template #title>
        Historique du service <span class="text-weight-bold">{{ selectedService.name }}</span>
      </template>
      <ni-responsive-table class="q-mb-sm" :data="selectedService.versions" :columns="serviceColumns"
        v-model:pagination="paginationHistory" :visible-columns="visibleHistoryColumns" />
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import ReponsiveTable from '@components/table/ResponsiveTable';
import { FIXED } from '@data/constants';

export default {
  name: 'ServiceHistoryModal',
  components: {
    'ni-modal': Modal,
    'ni-responsive-table': ReponsiveTable,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    selectedService: { type: Object, required: true },
    serviceColumns: { type: Array, required: true },
  },
  emits: ['update:model-value', 'hide'],
  data () {
    return {
      FIXED,
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      visibleHistoryColumns: ['startDate', 'name', 'defaultUnitAmount', 'vat', 'surcharge', 'exemptFromCharges'],
    };
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('update:model-value');
    },
  },
};
</script>
