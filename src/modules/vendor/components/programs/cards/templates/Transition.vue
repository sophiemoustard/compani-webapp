<template>
  <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
    @blur="updateCard('title')" :error="$v.card.title.$error" :disable="disableEdition" />
</template>

<script>
import { required } from 'vuelidate/lib/validators';
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
  validations () {
    return {
      card: { title: { required } },
    };
  },
};
</script>
