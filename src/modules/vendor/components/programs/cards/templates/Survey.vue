<template>
  <div>
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" />
    <div class="row gutter-profile">
      <ni-input class="col-md-6 col-xs-12" caption="Label gauche" v-model.trim="card.label.left"
        @focus="saveTmp('label.left')" @blur="updateCard('label.left')" :error="$v.card.label.$error" />
      <ni-input class="col-md-6 col-xs-12" caption="Label droit" v-model.trim="card.label.right"
        @focus="saveTmp('label.right')" @blur="updateCard('label.right')" />
    </div>
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'Survey',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
};
</script>
