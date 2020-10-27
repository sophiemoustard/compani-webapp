<template>
  <div>
    <ni-input caption="Texte recto" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-input caption="Texte verso" v-model="card.backText" required-field @focus="saveTmp('backText')"
      @blur="updateCard('backText')" :error="$v.card.backText.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

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
      card: { text: { required }, backText: { required } },
    };
  },
};
</script>
