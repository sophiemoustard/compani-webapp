<template>
  <q-checkbox v-model="validateTrainee" :label="`Je certifie remplir le questionnaire en tant que ${traineeName}`" />
  <ni-footer label="Valider" @submit="submit" :loading="loading" :disable="!validateTrainee" />
</template>

<script>
import { ref } from 'vue';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'End',
  components: {
    'ni-footer': Footer,
  },
  props: {
    loading: { type: Boolean, required: true },
    traineeName: { type: String, required: true },
  },
  emits: ['submit'],
  setup (_, { emit }) {
    const validateTrainee = ref(false);

    const submit = () => emit('submit');

    return {
      // Data
      validateTrainee,
      // Methods
      submit,
    };
  },
};
</script>
