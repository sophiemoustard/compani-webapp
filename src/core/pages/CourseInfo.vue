<template>
  <div>
    <div class="row col-12 course-info-header items-center justify-center">
      <div>Votre formation Compani</div>
    </div>
    <div class="row q-pa-sm q-mb-lg course-info-title-container items-center justify-center">
      <div class="col-xs-4 col-md-2 row items-center justify-center">
        <img class="course-info-img"
          src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/aux-pouce.png">
      </div>
      <div class="col-xs-8 col-md-10 course-info-title" >
        <h5>{{ course.name }}</h5>
      </div>
    </div>
  </div>
</template>

<script>
import Courses from '@api/Courses';

export default {
  metaInfo: { title: 'Course info' },
  name: 'CourseInfo',
  data () {
    return {
      course: {},
    };
  },
  async mounted () {
    this.course = await Courses.getById(this.$route.params.courseId);
  },
};

</script>

<style lang="stylus" scoped>
.course-info
  &-header
    background-color: $primary;
    padding: 16px;
    font-size: 20px;
    color: white;
    font-weight: bold;
  &-title
    border-bottom: 2px solid $grey-3
    text-align: center;
    &-container
      margin-top: 20px;
  &-img
    height: auto;
    width: 100px;
    padding-right: 20px;

h5
  color: $primary;
  font-weight: bold;

@media screen and (min-width: 768px)
  .course-info-title-container
    padding: 0px 125px;

  h5
    margin-bottom: 20px !important;
</style>
