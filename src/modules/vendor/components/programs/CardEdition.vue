<template>
  <div class="q-mx-md card-edition">
    <template v-if="card && Object.values(card).length">
      <transition v-if="card.template === TRANSITION" class="q-mx-lg" :card="card" />
      <title-text-media v-if="card.template === TITLE_TEXT_MEDIA" class="q-mx-lg" :card="card" />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { TRANSITION, TITLE_TEXT_MEDIA } from '@data/constants';
import Transition from 'src/modules/vendor/components/programs/templates/Transition';
import TitleTextMedia from 'src/modules/vendor/components/programs/templates/TitleTextMedia';

export default {
  name: 'CardEdition',
  components: {
    transition: Transition,
    'title-text-media': TitleTextMedia,
  },
  data () {
    return {
      TRANSITION,
      TITLE_TEXT_MEDIA,
    };
  },
  computed: {
    ...mapState('program', ['card']),
  },
}
</script>

<style lang="stylus" scoped>
.card-edition
  background-color: $middle-beige
  border-radius: 3px
  display: flex
  flex-direction: column
  justify-content: center
  flex: 1
</style>
