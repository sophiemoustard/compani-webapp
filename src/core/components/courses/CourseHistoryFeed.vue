<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row history-container-title">
      <div class="col-11">Historique d'activité</div>
      <div class="col-1 cursor-pointer">
        <ni-button icon="close" size="sm" @click="close" />
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
import { computed, ref } from 'vue';
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
  setup (_, { emit }) {
    const infiniteScroll = ref(null);

    const top = computed(() => (window.innerWidth >= 768 ? 300 : 350));

    const height = computed(() => window.innerHeight - top.value);

    const close = () => { emit('toggle-history'); };

    const load = (index, done) => { emit('load', index, done); };

    const resumeScroll = () => { infiniteScroll.value.resume(); };

    return {
      // Data
      infiniteScroll,
      // Computed
      height,
      top,
      // Methods
      close,
      load,
      resumeScroll,
    };
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
