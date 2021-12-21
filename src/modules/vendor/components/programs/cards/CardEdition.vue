<template>
  <div :class="['q-ml-md', 'card-edition', 'bg-peach-200', { 'edition-disabled': disableEdition }]">
    <q-scroll-area :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column', 'padding-top': '30px' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column', 'padding-top': '30px' }">
        <div v-if="card && Object.values(card).length">
          <component :is="templateInstance" :key="card._id" class="q-mx-lg" :disable-edition="disableEdition"
            @refresh="refreshCard" :card-parent="cardParent" />
        </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  TRANSITION,
  TITLE_TEXT_MEDIA,
  TITLE_TEXT,
  TEXT_MEDIA,
  FLASHCARD,
  FILL_THE_GAPS,
  ORDER_THE_SEQUENCE,
  SINGLE_CHOICE_QUESTION,
  MULTIPLE_CHOICE_QUESTION,
  SURVEY,
  OPEN_QUESTION,
  QUESTION_ANSWER,
} from '@data/constants';

export default {
  name: 'CardEdition',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      TRANSITION,
      TITLE_TEXT_MEDIA,
      TITLE_TEXT,
      TEXT_MEDIA,
      FLASHCARD,
      FILL_THE_GAPS,
      ORDER_THE_SEQUENCE,
      SINGLE_CHOICE_QUESTION,
      MULTIPLE_CHOICE_QUESTION,
      SURVEY,
      OPEN_QUESTION,
      QUESTION_ANSWER,
      currentTemplate: '',
    };
  },
  computed: {
    ...mapState('card', ['card']),
    templateInstance () {
      switch (this.currentTemplate) {
        case TRANSITION:
          return () => import('src/modules/vendor/components/programs/cards/templates/Transition');
        case TITLE_TEXT_MEDIA:
          return () => import('src/modules/vendor/components/programs/cards/templates/TitleTextMedia');
        case TITLE_TEXT:
          return () => import('src/modules/vendor/components/programs/cards/templates/TitleText');
        case TEXT_MEDIA:
          return () => import('src/modules/vendor/components/programs/cards/templates/TextMedia');
        case FLASHCARD:
          return () => import('src/modules/vendor/components/programs/cards/templates/Flashcard');
        case FILL_THE_GAPS:
          return () => import('src/modules/vendor/components/programs/cards/templates/FillTheGaps');
        case ORDER_THE_SEQUENCE:
          return () => import('src/modules/vendor/components/programs/cards/templates/OrderTheSequence');
        case SINGLE_CHOICE_QUESTION:
          return () => import('src/modules/vendor/components/programs/cards/templates/SingleChoiceQuestion');
        case MULTIPLE_CHOICE_QUESTION:
          return () => import('src/modules/vendor/components/programs/cards/templates/MultipleChoiceQuestion');
        case SURVEY:
          return () => import('src/modules/vendor/components/programs/cards/templates/Survey');
        case OPEN_QUESTION:
          return () => import('src/modules/vendor/components/programs/cards/templates/OpenQuestion');
        case QUESTION_ANSWER:
          return () => import('src/modules/vendor/components/programs/cards/templates/QuestionAnswer');
        default:
          return null;
      }
    },
  },
  watch: {
    'card.template': function (value) {
      this.currentTemplate = value;
    },
  },
  methods: {
    refreshCard () {
      this.$emit('refresh');
    },
  },
};
</script>

<style lang="sass" scoped>
.q-scrollarea
  height: 100%

.card-edition
  border-radius: 3px
  display: flex
  flex-direction: column
  flex: 1

.edition-disabled
  opacity: 0.6
</style>
