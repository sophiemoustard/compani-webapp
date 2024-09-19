<template>
  <div>
    <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="v$.card.title.$error" :error-message="errorMsg"
      :disable="disableEdition" />
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';
import { QUESTION_OR_TITLE_MAX_LENGTH } from '@data/constants';

export default {
  name: 'TitleText',
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
        title: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
        text: { required },
      },
    }));

    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => { emit('refresh'); };

    const { saveTmp, updateCard, errorMsg } = useCardTemplate(card, v$, refreshCard);

    return {
      // Validation
      v$,
      // Computed
      card,
      errorMsg,
      // Methods
      saveTmp,
      updateCard,
    };
  },
};
</script>
