<template>
  <q-btn v-if="type === FLOATING" class="fixed fab-custom" no-caps rounded color="primary" :icon="icon"
    :disable="disable" :label="label" @click="click" :loading="loading" />
  <q-btn v-else-if="type === MODAL" no-caps class="full-width modal-btn" :label="label" color="primary"
    :loading="loading" :icon-right="icon" @click="click" :disable="disable" />
  <q-btn v-else no-caps :label="label" :icon="icon" @click="click" color="primary" :loading="loading"
    :disable="disable" />
</template>

<script>
import { FLOATING, MODAL } from '@data/constants';

export default {
  name: 'PrimaryButton',
  props: {
    disable: { type: Boolean, default: false },
    icon: { type: String, default: undefined },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    type: { type: String, default: '' },
  },
  emits: ['click'],
  setup (_, { emit }) {
    const click = (event) => { emit('click', event); };

    return {
      // Data
      FLOATING,
      MODAL,
      // Methods
      click,
    };
  },
};

</script>
