<template>
  <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
    @blur="updateCard('title')" :error="v$.card.title.$error" :disable="disableEdition" />
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

export default {

  name: 'Transition',
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
      card: { title: { required } },
    }));

    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => { emit('refresh'); };

    const { saveTmp, updateCard } = useCardTemplate(card, v$, refreshCard);

    return {
      // Validations
      v$,
      // Data
      card,
      // Methods
      saveTmp,
      updateCard,
    };
  },

};
</script>
