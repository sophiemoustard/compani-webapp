<template>
  <div class="container" :style="{ height: `${height}px`, top: `${top}px` }">
    <div class="row container-title">
      <div class="col-11">Historique d'activité</div>
      <ni-button class="col-1" icon="clear" size="sm" />
    </div>
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'CourseHistoryFeed',
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      top: 230,
    };
  },
  computed: {
    height () {
      return window.innerHeight - this.top;
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
  margin: 16px 8px

</style>
