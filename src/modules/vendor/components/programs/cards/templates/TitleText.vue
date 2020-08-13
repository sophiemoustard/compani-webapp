<template>
  <div>
    <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" />
    <ni-input caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleText',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
}
</script>
