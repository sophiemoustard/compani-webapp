<template>
  <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
    @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
    type="textarea" :disable="disableEdition" />
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'TitleText',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: { question: { required, maxLength: maxLength(5) } },
    };
  },
  computed: {
    questionErrorMsg () {
      if (!this.$v.card.question.required) return REQUIRED_LABEL;
      if (!this.$v.card.question.maxLength) {
        return `${this.$v.card.question.$params.maxLength.max} caractères maximum.`;
      }
      return '';
    },
  },
};
</script>
