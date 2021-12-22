<template>
  <q-item dense :to="{ name: name, params: params, query: query }" exact>
    <q-item-section avatar><q-icon :name="icon" size="20px" /></q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    params: { type: Object, default: () => ({}) },
    query: { type: Object, default: () => ({}) },
    name: { type: String, default: '' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
};
</script>
