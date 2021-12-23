<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Historique de la souscription
      <span v-if="subscription.service" class="text-weight-bold">{{ subscription.service.name }}</span>
    </template>
    <ni-responsive-table class="q-mb-sm" :data="subscription.versions" :columns="subscriptionHistoryColumns"
      :pagination.sync="paginationHistory">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-responsive-table>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';

export default {
  name: 'SubscriptionHistoryModal',
  props: {
    value: { type: Boolean, default: false },
    subscription: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-responsive-table': ResponsiveTable,
  },
  mixins: [
    subscriptionMixin,
  ],
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
