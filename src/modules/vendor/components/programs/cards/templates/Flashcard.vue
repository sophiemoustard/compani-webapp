<template>
  <div>
    <ni-input caption="Texte recto" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" :disable="disableEdition"
      :error-message="textErrorMessage($v.card.text)" />
    <ni-input caption="Texte verso" v-model="card.backText" required-field @focus="saveTmp('backText')"
      @blur="updateCard('backText')" :error="$v.card.backText.$error" type="textarea" :disable="disableEdition"
      :error-message="textErrorMessage($v.card.backText)" />
  </div>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { REQUIRED_LABEL, FLASHCARD_TEXT_MAX_LENGTH } from '@data/constants';

export default {
  name: 'Flashcard',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        text: { required, maxLength: maxLength(FLASHCARD_TEXT_MAX_LENGTH) },
        backText: { required, maxLength: maxLength(FLASHCARD_TEXT_MAX_LENGTH) },
      },
    };
  },
  methods: {
    textErrorMessage (modifiedText) {
      if (!modifiedText.required) return REQUIRED_LABEL;
      if (!modifiedText.maxLength) return `${FLASHCARD_TEXT_MAX_LENGTH} caractères maximum.`;
      return '';
    },
  },
};
</script>
