<template>
  <div class="q-mx-md card-edition">
    <q-scroll-area :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column', 'padding-top': '30px' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column', 'padding-top': '30px' }">
        <div v-if="card && Object.values(card).length">
          <transition v-if="card.template === TRANSITION" :key="card._id" class="q-mx-lg" :card="card" />
          <title-text-media v-else-if="card.template === TITLE_TEXT_MEDIA" :key="card._id" class="q-mx-lg"
            :card="card" />
          <title-text v-else-if="card.template === TITLE_TEXT" :key="card._id" class="q-mx-lg" :card="card" />
          <text-media v-else-if="card.template === TEXT_MEDIA" :key="card._id" class="q-mx-lg" :card="card" />
          <flashcard v-else-if="card.template === FLASHCARD" :key="card._id" class="q-mx-lg" :card="card" />
          <fill-the-gaps v-else-if="card.template === FILL_THE_GAPS" :key="card._id" class="q-mx-lg" :card="card" />
          <order-the-sequence v-else-if="card.template === ORDER_THE_SEQUENCE" :key="card._id" class="q-mx-lg"
            :card="card" />
          <single-choice-question v-else-if="card.template === SINGLE_CHOICE_QUESTION" :key="card._id" class="q-mx-lg"
            :card="card" />
          <multiple-choice-question v-else-if="card.template === MULTIPLE_CHOICE_QUESTION" :key="card._id"
            class="q-mx-lg" :card="card" />
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
} from '@data/constants';
import Transition from 'src/modules/vendor/components/programs/cards/templates/Transition';
import TitleTextMedia from 'src/modules/vendor/components/programs/cards/templates/TitleTextMedia';
import TitleText from 'src/modules/vendor/components/programs/cards/templates/TitleText';
import TextMedia from 'src/modules/vendor/components/programs/cards/templates/TextMedia';
import Flashcard from 'src/modules/vendor/components/programs/cards/templates/Flashcard';
import FillTheGaps from 'src/modules/vendor/components/programs/cards/templates/FillTheGaps';
import OrderTheSequence from 'src/modules/vendor/components/programs/cards/templates/OrderTheSequence';
import SingleChoiceQuestion from 'src/modules/vendor/components/programs/cards/templates/SingleChoiceQuestion';
import MultipleChoiceQuestion from 'src/modules/vendor/components/programs/cards/templates/MultipleChoiceQuestion';

export default {
  name: 'CardEdition',
  components: {
    transition: Transition,
    'title-text-media': TitleTextMedia,
    'title-text': TitleText,
    'text-media': TextMedia,
    flashcard: Flashcard,
    'fill-the-gaps': FillTheGaps,
    'order-the-sequence': OrderTheSequence,
    'single-choice-question': SingleChoiceQuestion,
    'multiple-choice-question': MultipleChoiceQuestion,
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
    };
  },
  computed: {
    ...mapState('program', ['card']),
  },
};
</script>

<style lang="stylus" scoped>
.q-scrollarea
  height: 100%

.card-edition
  background-color: $middle-beige
  border-radius: 3px
  display: flex
  flex-direction: column
  flex: 1
</style>
