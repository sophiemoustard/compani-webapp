<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Détail du tiers payeur <span class="text-weight-bold">{{ thirdPartyPayer.name }}</span>
    </template>
    <q-table class="q-mb-xl" :rows="[thirdPartyPayer]" :columns="columns" hide-bottom flat grid
      :visible-columns="visibleColumns">
      <template #item="props">
        <q-card class="full-width q-mb-md" flat bordered>
          <q-list separator dense>
            <q-item v-for="col in props.cols" :key="col.name" class="row">
              <q-item-section class="col-5">
                <q-item-label :data-cy="`col-${col.name}`">{{ col.label }}</q-item-label>
              </q-item-section>
              <q-item-section class="col-7" side>
                <q-item-label caption :data-cy="`col-side-${col.name}`">{{ col.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </template>
    </q-table>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';

export default {
  name: 'ThirdPartyPayerDetailsModal',
  props: {
    modelValue: { type: Boolean, default: false },
    thirdPartyPayer: { type: Object, default: () => ({}) },
    columns: { type: Array, default: () => ([]) },
    visibleColumns: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value'],
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

<style lang="sass" scoped>
  .q-item__section--main
    .q-item__label
      font-size: 0.80rem
</style>
