<template>
  <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
    @blur="updateCard('title')" :error="v$.card.title.$error" :disable="disableEdition" />
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'Transition',
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
      card: { title: { required } },
    };
  },
};
</script>
