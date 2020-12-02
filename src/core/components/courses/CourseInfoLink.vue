<template>
  <div class="course-link">
    <ni-bi-color-button icon="info" label="Page info formation" :disable="disableLink" :href="courseLink"
      size="16px" type="a" />
    <ni-button color="primary" :disable="disableLink" icon="link" label="Obtenir un lien de partage"
      v-clipboard:copy="!disableLink && courseLink" v-clipboard:success="handleCopySuccess" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { NotifyPositive } from '@components/popup/notify';
import Button from '@components/Button';
import BiColorButton from '@components/BiColorButton';

export default {
  name: 'CourseInfoLink',
  components: {
    'ni-button': Button,
    'ni-bi-color-button': BiColorButton,
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
