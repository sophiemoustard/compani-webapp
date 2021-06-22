<template>
<q-card>
  <div class="row justify-between q-py-md q-px-sm bg-copper-100">
    <div class="row items-center">
      <q-icon size="24px" name="mdi-library-books" class="q-ma-sm" color="copper-grey-800" />
      <div class="text-copper-grey-800 text-weight-bold">Note de suivi ({{ notesList.length }})</div>
    </div>
   <ni-button class="bg-primary" color="white" icon="add" label="Nouvelle note" />
</div>
<div v-if="notesList.length">
  <div v-for="note of notesList" :key="note._id">
    <customer-note-cell :note="note" />
  </div>
</div>
<div v-else class="text-italic text-center q-my-md">Aucune note de suivi pour ce bénéficiaire.</div>
<div v-if="notesList.length" class=" row justify-center">
  <ni-button no-caps rounded color="primary" :label="displayAllNotes ? 'Afficher tout' : 'Afficher moins'"
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
  methods: {
    update (event) {
      this.$emit('update:displayAllNotes', event);
    },
  },
};
</script>
