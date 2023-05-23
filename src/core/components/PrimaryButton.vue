<template>
  <q-btn v-if="type === FLOATING" class="fixed fab-custom" no-caps rounded color="primary" :icon="icon"
    :disable="disable" :label="label" @click="click" />
  <q-btn v-else-if="type === MODAL" no-caps class="full-width modal-btn" :label="label" color="primary"
    :loading="loading" :icon-right="icon" @click="click" />
  <q-btn v-else no-caps :label="label" :icon="icon" @click="click" color="primary" />
</template>

<script>
import { DEFAULT, FLOATING, MODAL } from '@data/constants';

export default {
  name: 'NiButton',
  props: {
    disable: { type: Boolean, default: false },
    icon: { type: String, default: undefined },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    type: { type: String, default: DEFAULT },
  },
  emits: ['click'],
  setup (props, { emit }) {
    const click = (event) => { emit('click', event); };

    return {
      // Data
      DEFAULT,
      FLOATING,
      MODAL,
      // Methods
      click,
    };
  },
};

</script>
