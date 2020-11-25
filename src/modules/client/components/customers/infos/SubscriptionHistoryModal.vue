<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Historique de la souscription
      <span v-if="selected.service" class="text-weight-bold">{{ selected.service.name }}</span>
    </template>
    <ni-responsive-table class="q-mb-sm" :data="selected.versions" :columns="subscriptionHistoryColumns"
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
    selected: { type: Object, default: () => ({}) },
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
