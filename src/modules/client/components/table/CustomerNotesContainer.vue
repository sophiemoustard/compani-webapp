<template>
  <q-card>
    <div class="flex-row justify-between q-pa-sm bg-copper-100">
      <div class="flex-row items-center">
        <q-icon size="24px" name="mdi-library-books" class="q-ma-sm" color="copper-grey-800" />
        <div class="text-copper-grey-800 text-weight-bold">Note de suivi ({{ notesList.length }})</div>
      </div>
      <ni-button class="bg-primary" color="white" icon="add" label="Nouvelle note" @click="openNewNoteModal" />
    </div>
    <template v-if="visibleNotesList.length">
      <div v-for="note of visibleNotesList" :key="note._id">
        <customer-note-cell :note="note" @open-edited-note-modal="openEditedNoteModal" />
        <q-separator v-if="notesList.length > 1" class="q-mx-sm q-mb-sm" />
      </div>
    </template>
    <div v-else class="text-italic text-center q-py-sm">Aucune note de suivi.</div>
    <div v-if="notesList.length > 3" class="flex-row justify-center">
      <ni-button :label="displayAllNotes ? 'Afficher moins' : 'Afficher tout'" @click="update(!displayAllNotes)" />
    </div>
  </q-card>
</template>

<script>
import Button from '@components/Button';
import CustomerNoteCell from './CustomerNoteCell';

export default {
  name: 'CustomerNotesContainer',
  components: {
    'ni-button': Button,
    'customer-note-cell': CustomerNoteCell,
  },
  props: {
    notesList: { type: Array, required: true, default: () => [] },
    displayAllNotes: { type: Boolean, default: false },
  },
  emits: ['update:display-all-notes', 'open-new-note-modal', 'open-edited-note-modal'],
  computed: {
    visibleNotesList () {
      if (this.displayAllNotes || this.notesList.length < 3) return this.notesList;
      return this.notesList.slice(0, 3);
    },
  },
  methods: {
    openNewNoteModal () {
      this.$emit('open-new-note-modal');
    },
    openEditedNoteModal (editedNote) {
      this.$emit('open-edited-note-modal', editedNote);
    },
    update (event) {
      this.$emit('update:display-all-notes', event);
    },
  },
};
</script>
