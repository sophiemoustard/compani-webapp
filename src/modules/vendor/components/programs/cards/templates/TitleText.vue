<template>
  <div>
    <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="v$.card.title.$error" :disable="disableEdition" />
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleText',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  setup () {
    return { v$: useVuelidate() };
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: { title: { required }, text: { required } },
    };
  },
};
</script>
