<template>
  <div class="course-link">
    <ni-button :disable="disableLink" type="a" :href="courseLink" color="primary" icon="info" />
    <ni-button :disable="disableLink" type="a" :href="courseLink"
      label="Page info formation" color="black" size="16px" />
    <ni-button color="primary" :disable="disableLink" icon="link" label="Obtenir un lien de partage"
      v-clipboard:copy="!disableLink && courseLink" v-clipboard:success="handleCopySuccess" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { NotifyPositive } from '@components/popup/notify';
import Button from '@components/Button';

export default {
  name: 'CourseInfoLink',
  components: {
    'ni-button': Button,
  },
  props: {
    disableLink: { type: Boolean, default: true },
  },
  computed: {
    ...mapState('course', ['course']),
    courseLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/`
        + `trainees/courses/${this.course._id}`;
    },
  },
  methods: {
    handleCopySuccess () {
      return NotifyPositive('Lien copié !');
    },
  },
};
</script>

<style lang="stylus" scoped>
.course-link
  @media screen and (min-width: 1024px)
    display: flex
    flex-direction: row
    align-items: center
    justify-content: left
</style>
