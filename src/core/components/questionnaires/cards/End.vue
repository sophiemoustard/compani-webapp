<template>
  <div class="card-container">
    <q-checkbox v-model="validateTrainee">
      <label>
        Je certifie remplir le questionnaire en tant que <span class="text-weight-bold">{{ traineeName }}</span>
      </label>
    </q-checkbox>
    <ni-secondary-button label="Modifier le répondant" color="white" background="primary" @click="updateCardIndex"
      class="elm-width q-my-lg" />
    <ni-footer label="Valider" @submit="submit" :loading="loading" :disable="!validateTrainee" />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import Footer from '@components/questionnaires/cards/Footer';
import SecondaryButton from '@components/SecondaryButton';
import { GO_TO_CARD, START_CARD_INDEX } from '@data/constants';

export default {
  name: 'End',
  components: {
    'ni-footer': Footer,
    'ni-secondary-button': SecondaryButton,
  },
  props: {
    loading: { type: Boolean, required: true },
    traineeName: { type: String, required: true },
  },
  emits: ['submit'],
  setup (_, { emit }) {
    const validateTrainee = ref(false);
    const $store = useStore();

    const submit = () => emit('submit');

    const updateCardIndex = () => {
      $store.dispatch('questionnaire/updateCardIndex', { type: GO_TO_CARD, index: START_CARD_INDEX });
    };

    return {
      // Data
      validateTrainee,
      // Methods
      submit,
      updateCardIndex,
    };
  },
};
</script>
