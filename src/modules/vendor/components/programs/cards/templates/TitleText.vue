<template>
  <div>
    <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="v$.card.title.$error" :disable="disableEdition" />
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleText',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  setup () {
    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: { title: { required }, text: { required } },
    }));

    const v$ = useVuelidate(rules, { card });

    return {
      // Validation
      v$,
      // Computed
      card,
    };
  },
};
</script>
