<template>
  <div>
    <ni-input caption="Texte recto" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" />
    <ni-input caption="Texte verso" v-model.trim="card.backText" required-field @focus="saveTmp('backText')"
      @blur="updateCard('backText')" :error="$v.card.backText.$error" type="textarea" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'Flashcard',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
};
</script>
