<template>
  <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
    @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleText',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: { question: { required } },
    };
  },
};
</script>
