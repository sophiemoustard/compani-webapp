<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row history-container-title">
      <div class="col-11">Historique d'activité</div>
      <div class="col-1 cursor-pointer">
        <ni-button icon="clear" size="sm" @click.native="close" />
      </div>
    </div>
    <div>
      <course-history v-for="courseHistory in courseHistories" :key="courseHistory._id"
        :course-history="courseHistory" />
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
  data () {
    return {
      top: 300,
    };
  },
  computed: {
    height () {
      return window.innerHeight - this.top;
    },
  },
  methods: {
    close () {
      this.$emit('toggle-history');
    },
  },
};
</script>

<style  lang="stylus" scoped>
  .history-container-title
    height: 8%
</style>
