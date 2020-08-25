<template functional>
  <q-item v-if="props.displayItem" :to="{ name: props.name, params: props.params, query: props.query }" exact>
    <q-item-section avatar><q-icon :name="props.icon" size="xs" /></q-item-section>
    <q-item-section>{{ props.label }}</q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    params: { type: Object, default: () => ({}) },
    query: { type: Object, default: () => ({}) },
    name: { type: String, default: '' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    displayItem: { type: Boolean, default: true },
  },
};
</script>
