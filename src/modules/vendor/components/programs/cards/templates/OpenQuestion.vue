<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
      class="q-mb-lg" dense :disable="disableEdition" />
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { QUESTION_MAX_LENGTH } from '@data/constants';

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
    return { v$: useVuelidate() };
  },
  validations () {
    return {
      card: { question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) } },
    };
  },
};
</script>
