<template functional>
  <q-item :to="{ name: props.name, params: props.params, query: props.query }" exact>
    <q-item-section avatar><q-icon :name="props.icon" size="xs" /></q-item-section>
    <q-item-section>{{ props.label }}</q-item-section>
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
