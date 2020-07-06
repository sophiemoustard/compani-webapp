<template>
  <div class="course-link">
    <q-item>
      <q-item-section side>
        <q-btn :disable="disabledFollowUp" color="primary" size="sm" icon="info" flat dense type="a"
          target="_blank" :href="!disabledFollowUp && courseLink" />
      </q-item-section>
      <q-item-section class="course-link">Page info formation</q-item-section>
    </q-item>
    <div class="course-link-share" v-clipboard:copy="!disabledFollowUp && courseLink"
      v-clipboard:success="handleCopySuccess">
      <q-btn color="primary" size="xs" :disable="disabledFollowUp" icon="link" flat dense />
      <div class="course-link-share-label" :class="{ 'course-link-share-label-disabled': disabledFollowUp }"
        color="primary">
        Obtenir un lien de partage
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { NotifyPositive } from '@components/popup/notify';
import get from 'lodash/get'

export default {
  name: 'CourseInfoLink',
  data () {
    return {
      isClientInterface: !/\/ad\//.test(this.$router.currentRoute.path),
    }
  },
  computed: {
    ...mapState('course', ['course']),
    courseLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/` +
        `trainees/courses/${this.course._id}`;
    },
    disabledFollowUp () {
      return !this.course.trainer ||
        !this.course.trainees || !this.course.trainees.length ||
        !this.course.slots || !this.course.slots.length ||
        !get(this.course, 'contact.name') ||
        !get(this.course, 'contact.phone');
    },
  },
  methods: {
    handleCopySuccess () {
      return NotifyPositive('Lien copié !');
    },
  },
}
</script>

<style lang="stylus" scoped>
.q-item
  padding-left: 0px;
.course-link
  @media screen and (min-width: 1025px)
    display: flex
    flex-direction: row
    align-items: center
    justify-content: left
  &-share
    display: flex
    flex-direction: row
    align-items: center
    @media screen and (max-width: 1024px)
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
