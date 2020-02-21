<template>
  <q-item v-if="displayItem" :to="{ name, params, query }" exact>
    <q-item-section avatar><q-icon :name="icon" size="xs" /></q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    params: Object,
    query: Object,
    name: String,
    label: String,
    icon: String,
    displayItem: { type: Boolean, default: true },
  },
}
</script>
