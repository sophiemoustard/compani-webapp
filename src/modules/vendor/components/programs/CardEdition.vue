<template>
  <div>
    <div class="q-mx-md card-edition">
      <template v-if="card && Object.values(card).length">
        <transition v-if="card.template === TRANSITION" class="q-mx-lg" :card="card" />
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { TRANSITION } from '@data/constants';
import Transition from 'src/modules/vendor/components/programs/templates/Transition';

export default {
  name: 'CardEdition',
  components: {
    transition: Transition,
  },
  data () {
    return {
      TRANSITION,
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
  height: 100%
  border-radius: 3px
  display: flex
  flex-direction: column
  justify-content: center
</style>
