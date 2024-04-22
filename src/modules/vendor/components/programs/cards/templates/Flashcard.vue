<template>
  <div>
    <ni-input caption="Texte recto" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition"
      :error-message="textErrorMessage(v$.card.text)" />
    <ni-input caption="Texte verso" v-model="card.backText" required-field @focus="saveTmp('backText')"
      @blur="updateCard('backText')" :error="v$.card.backText.$error" type="textarea" :disable="disableEdition"
      :error-message="textErrorMessage(v$.card.backText)" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { REQUIRED_LABEL, FLASHCARD_TEXT_MAX_LENGTH } from '@data/constants';
import { useCardTemplate } from '../../../../composables/CardTemplate';

export default {
  name: 'Flashcard',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  emits: ['refresh'],
  setup (_, { emit }) {
    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        text: { required, maxLength: maxLength(FLASHCARD_TEXT_MAX_LENGTH) },
        backText: { required, maxLength: maxLength(FLASHCARD_TEXT_MAX_LENGTH) },
      },
    }));

    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => {
      emit('refresh');
    };

    const { updateCard, saveTmp } = useCardTemplate(card, v$, refreshCard);

    const textErrorMessage = (modifiedText) => {
      if (get(modifiedText, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(modifiedText, 'maxLength.$response') === false) return `${FLASHCARD_TEXT_MAX_LENGTH} caractères maximum.`;

      return '';
    };

    return {
      // Validation
      v$,
      // Computed
      card,
      // Methods
      textErrorMessage,
      updateCard,
      saveTmp,
    };
  },
};
</script>
