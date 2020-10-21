<template>
  <div class="course-link">
    <ni-button :disable="disableLink" type="a" :href="courseLink" color="primary" icon="info" />
    <ni-button :disable="disableLink" type="a" :href="courseLink"
      label="Page info formation" color="black" size="16px" />
    <div class="q-mx-sm course-link-share" v-clipboard:copy="!disableLink && courseLink"
      v-clipboard:success="handleCopySuccess">
      <ni-button color="primary" :disable="disableLink" icon="link" size="xs" />
      <div class="course-link-share-label" :class="{ 'course-link-share-label-disabled': disableLink }"
        color="primary">
        Obtenir un lien de partage
      </div>
    </div>
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
  &-share
    display: flex
    flex-direction: row
    align-items: center
    @media screen and (max-width: 1023px)
      padding: 0 0 10px 55px
    &-label
      cursor: pointer
      color: $primary
      text-decoration underline
      font-size: 14px
      @media screen and (max-width: 767px)
        font-size: 12px
      &-disabled
        opacity: 0.7 !important;
        cursor: not-allowed !important
</style>
