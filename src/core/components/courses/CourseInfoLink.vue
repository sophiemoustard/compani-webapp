<template>
  <div class="course-link">
    <ni-bi-color-button icon="info" label="Convocation papier" :disable="disableLink" :href="courseLink()"
      size="16px" type="a" />
    <ni-button color="primary" :disable="disableLink" icon="link" label="Obtenir un lien de partage"
      v-clipboard:copy="!disableLink && courseLink()" v-clipboard:success="handleCopySuccess" />
</div>
</template>

<script>
import { mapState } from 'vuex';
import { NotifyPositive } from '@components/popup/notify';
import Button from '@components/Button';
import BiColorButton from '@components/BiColorButton';
import Courses from '@api/Courses';

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
  },
  methods: {
    handleCopySuccess () {
      return NotifyPositive('Lien copié !');
    },
    courseLink () {
      return Courses.getPdfUrl(this.course._id);
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
