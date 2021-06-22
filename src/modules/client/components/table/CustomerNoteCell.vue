<template>
<div class="q-pa-sm">
  <div class="text-primary">{{ note.title }}</div>
  <div>{{ description.title }}</div>
  <q-separator class="q-mt-sm" />
</div>
</template>

<script>

export default {
  name: 'CustomerNoteCell',
  props: {
    note: { type: Object, required: true, default: () => ({}) },
  },
};
</script>
