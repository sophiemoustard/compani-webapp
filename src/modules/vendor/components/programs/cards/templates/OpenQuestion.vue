<template>
  <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
    @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
    type="textarea" :disable="disableEdition" />
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
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
  validations () {
    return {
      card: { question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) } },
    };
  },
};
</script>
