<template>
  <div class="q-mx-md card-edition">
    <q-scroll-area :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column' }">
        <div v-if="card && Object.values(card).length">
          <transition v-if="card.template === TRANSITION" class="q-mx-lg" :card="card" />
          <title-text-media v-if="card.template === TITLE_TEXT_MEDIA" class="q-mx-lg" :card="card" />
        </div>
    </q-scroll-area>
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
.q-scrollarea
  height: 100%

.card-edition
  padding-top: 30px
  background-color: $middle-beige
  border-radius: 3px
  display: flex
  flex-direction: column
  flex: 1
</style>
