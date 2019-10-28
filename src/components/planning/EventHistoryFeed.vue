<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${this.top}px` }">
    <div class="row history-title">
      <div class="col-11">Flux d'activité</div>
      <div class="col-1 cursor-pointer">
        <q-icon name="clear" size="16px" @click.native="close" />
      </div>
    </div>
    <q-infinite-scroll inline @load="load" class="scroll-container">
      <ni-event-history v-for="history in eventHistories" :key="history._id" :history="history" />
      <div slot="loading" class="loading">
        <q-spinner />
      </div>
    </q-infinite-scroll>
  </div>
</template>

<script>
import NiEventHistory from './EventHistory';

export default {
  name: 'EventHistoryFeed',
  props: {
    eventHistories: { type: Array, default: () => ([]) },
  },
  computed: {
    height () {
      return window.innerHeight - this.top;
    },
    top () {
      return window.innerWidth >= 768 ? 60 : 100;
    },
  },
  components: {
    'ni-event-history': NiEventHistory,
  },
  methods: {
    close () {
      this.$emit('toggleHistory');
    },
    load (index, done) {
      this.$emit('updateFeeds', done);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .history-container
    background-color: $white
    width: 300px
    top: 60px
    @media (max-width: 767px)
      top: 100px
    right: 0
    position: absolute
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 5px 8px rgba(0,0,0,0.14), 0 1px 14px rgba(0,0,0,0.12)

  .history-title
    margin: 10px 2px
    padding: 5px
    height: 5%

  .loading
    width: 100%
    height: 30px
    display: flex
    justify-content: center
    margin: 10px 0

  .scroll-container
    height: 95%
    overflow: auto
</style>
