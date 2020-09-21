<template>
  <div>
    <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" :disable="disableEdition" />
    <ni-input caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" :error-message="textErrorMsg"
      type="textarea" :disable="disableEdition" />
  </div>
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
      card: { title: { required }, text: { required, maxLength: maxLength(5) } },
    };
  },
  computed: {
    textErrorMsg () {
      if (!this.$v.card.text.required) return REQUIRED_LABEL;
      if (!this.$v.card.text.maxLength) return `${this.$v.card.text.$params.maxLength.max} caractères autorisés.`;
      return '';
    },
  },
};
</script>
