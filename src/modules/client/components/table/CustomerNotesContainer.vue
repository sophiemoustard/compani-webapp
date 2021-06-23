<template>
  <q-card>
    <div class="row justify-between q-py-md q-px-sm bg-copper-100">
      <div class="row items-center">
        <q-icon size="24px" name="mdi-library-books" class="q-ma-sm" color="copper-grey-800" />
        <div class="text-copper-grey-800 text-weight-bold">Note de suivi ({{ notesList.length }})</div>
      </div>
      <ni-button class="bg-primary" color="white" icon="add" label="Nouvelle note" @click="openNewNoteModal" />
    </div>
    <div v-if="visibleNotesList.length">
      <div v-for="note of visibleNotesList" :key="note._id">
        <customer-note-cell :note="note" />
        <q-separator v-if="notesList.length > 1" class="q-mx-sm q-mb-sm" />
      </div>
    </div>
    <div v-else class="text-italic text-center q-my-md">Aucune note de suivi pour ce bénéficiaire.</div>
    <div v-if="notesList.length > 3" class=" row justify-center">
      <ni-button no-caps rounded color="primary" :label="displayAllNotes ? 'Afficher moins' : 'Afficher tout'"
        @click="update(!displayAllNotes)" />
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
  computed: {
    visibleNotesList () {
      if (this.displayAllNotes || this.notesList.length < 3) return this.notesList;
      return [this.notesList[0], this.notesList[1], this.notesList[2]];
    },
  },
  methods: {
    openNewNoteModal () {
      this.$emit('openNewNoteModal');
    },
    update (event) {
      this.$emit('update:displayAllNotes', event);
    },
  },
};
</script>
