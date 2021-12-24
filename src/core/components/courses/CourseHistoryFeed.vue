<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row history-container-title">
      <div class="col-11">Historique d'activité</div>
      <div class="col-1 cursor-pointer">
        <ni-button icon="close" size="sm" @click.native="close" />
      </div>
    </div>
    <div class="scroll-container" :style="{ height: `${height - 50}px` }" ref="scrollTarget">
      <q-infinite-scroll @load="load" :offset="100" :scroll-target="$refs.scrollTarget" ref="infiniteScroll">
        <course-history v-for="courseHistory in courseHistories" :key="courseHistory._id"
          :course-history="courseHistory" />
        <template #loading>
          <div class="loading">
            <q-spinner />
          </div>
      </template>
      </q-infinite-scroll>
    </div>
  </div>
</template>

<script>
import Button from '@components/Button';
import CourseHistory from './CourseHistory';

export default {
  name: 'CourseHistoryFeed',
  components: {
    'ni-button': Button,
    'course-history': CourseHistory,
  },
  props: {
    courseHistories: { type: Array, default: () => ([]) },
  },
  emits: ['toggle-history', 'load'],
  computed: {
    height () {
      return window.innerHeight - this.top;
    },
    top () {
      return window.innerWidth >= 768 ? 300 : 350;
    },
  },
  methods: {
    close () {
      this.$emit('toggle-history');
    },
    load (index, done) {
      this.$emit('load', done);
    },
    resumeScroll () {
      this.$refs.infiniteScroll.resume();
    },
  },
};
</script>

<style lang="sass" scoped>
.scroll-container
  overflow-y: auto
  overflow-x: hidden

.loading
  width: 100%
  margin: 4px 0
  display: flex
  justify-content: center
  height: 24px
</style>
