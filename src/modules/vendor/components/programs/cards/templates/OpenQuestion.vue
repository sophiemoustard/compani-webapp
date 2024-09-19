<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="errorMsg"
      type="textarea" :disable="disableEdition" />
    <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
      class="q-mb-lg" dense :disable="disableEdition" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { QUESTION_OR_TITLE_MAX_LENGTH } from '@data/constants';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

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

    const refreshCard = () => { emit('refresh'); };

    const card = computed(() => $store.state.card.card);

    const rules = { card: { question: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) } } };
    const v$ = useVuelidate(rules, { card });

    const { errorMsg, saveTmp, updateCard } = useCardTemplate(card, v$, refreshCard);

    return {
      // Validations
      v$,
      // Computed
      card,
      // Methods
      errorMsg,
      saveTmp,
      updateCard,
    };
  },
};
</script>
