<template>
  <div class="q-pa-sm">
    <div class="text-primary ellipsis">{{ note.title }}</div>
    <div class="ellipsis">{{ note.description }}</div>
  </div>
</template>

<script>

export default {
  name: 'CustomerNoteCell',
  props: {
    note: { type: Object, required: true },
  },
};
</script>
