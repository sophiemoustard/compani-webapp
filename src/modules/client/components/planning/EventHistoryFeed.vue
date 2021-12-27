<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row history-container-title">
      <div class="col-11">Flux d'activité</div>
      <div class="col-1 cursor-pointer">
        <ni-button icon="close" size="sm" @click="close" />
      </div>
    </div>
    <div class="scroll-container" ref="scrollTargetRef">
      <q-infinite-scroll @load="load" :offset="100" :scroll-target="$refs.scrollTargetRef">
        <ni-event-history v-for="history in eventHistories" :key="history._id" :history="history" class="q-ma-xs" />
        <div slot="loading" class="loading">
          <q-spinner />
        </div>
      </q-infinite-scroll>
    </div>
  </div>
</template>

<script>
import Button from '@components/Button';
import NiEventHistory from 'src/modules/client/components/planning/EventHistory';

export default {
  name: 'EventHistoryFeed',
  props: {
    eventHistories: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-event-history': NiEventHistory,
    'ni-button': Button,
  },
  computed: {
    height () {
      return window.innerHeight - this.top;
    },
    top () {
      return window.innerWidth >= 768 ? 60 : 100;
    },
  },
  methods: {
    close () {
      this.$emit('toggle-history');
    },
    load (index, done) {
      this.$emit('update-feeds', done);
    },
  },
};
</script>

<style lang="sass" scoped>
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
