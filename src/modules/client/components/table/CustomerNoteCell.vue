<template>
  <div class="q-py-sm q-px-md cursor-pointer" @click="openEditedNoteModal">
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
  methods: {
    openEditedNoteModal () {
      this.$emit('openEditedNoteModal', this.note);
    },
  },
};
</script>
