<template>
  <div class="container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row container-title">
      <div class="col-11">Historique d'activité</div>
      <ni-button class="col-1" icon="clear" size="sm" @click="close" />
    </div>
    <course-history v-for="courseHistory in courseHistories" :key="courseHistory._id" :course-history="courseHistory" />
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
.container
  position: absolute
  right: 0
  background-color: $white
  width: 300px

.container-title
  margin: 16px 8px 0 8px

</style>
