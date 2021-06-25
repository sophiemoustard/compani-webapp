<template>
  <div class="q-py-sm q-px-md">
    <div class="text-primary ellipsis q-mb-sm">{{ note.title }}</div>
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
