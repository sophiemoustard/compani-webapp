<template>
  <div class="course-link">
    <div>
      <ni-button :disable="disableLink" color="primary" icon="info" type="a" :href="courseLink" />
      <ni-button :disable="disableLink" color="black" size="16px" type="a" :href="courseLink"
        label="Page info formation" />
    </div>
    <q-item>
      <q-item-section side>
        <ni-button :disable="disableLink" color="primary" icon="info" type="a" :href="courseLink" />
      </q-item-section>
      <q-item-section>
        <ni-button :disable="disableLink" color="black" size="16px" type="a" :href="courseLink"
          label="Page info formation" />
      </q-item-section>
    </q-item>
    <div class="course-link-share" v-clipboard:copy="!disableLink && courseLink"
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
.q-item
  padding-left: 0px;
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
