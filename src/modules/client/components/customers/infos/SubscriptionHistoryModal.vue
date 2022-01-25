<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Historique de la souscription
      <span v-if="subscription.service" class="text-weight-bold">{{ subscription.service.name }}</span>
    </template>
    <ni-responsive-table class="q-mb-sm" :data="subscription.versions" :columns="subscriptionHistoryColumns"
      :v-model:pagination="paginationHistory" />
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';

export default {
  name: 'SubscriptionHistoryModal',
  props: {
    modelValue: { type: Boolean, default: false },
    subscription: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-responsive-table': ResponsiveTable,
  },
  emits: ['hide', 'update:model-value'],
  mixins: [subscriptionMixin],
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
