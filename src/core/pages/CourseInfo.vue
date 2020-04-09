<template>
  <div>
    <div class="row col-12 q-pa-md course-header items-center justify-center text-weight-bold">
      <div>Votre formation Compani</div>
    </div>
    <div class="course-title-container items-center justify-center">
      <img class="course-img"
        src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/aux-pouce.png">
      <div class="course-title" >
        <h5>{{ course.name }}</h5>
      </div>
    </div>
    <div class="row justify-center">
      <div>
        <p class="text-weight-bold q-pl-xl">Dates de la formation</p>
        <q-stepper value="date" vertical flat>
          <q-step v-for="(daySlot, index) in Object.values(courseSlots)" name="date" :color="getSlotColor(daySlot)"
            :class="{ 'opacity': isDone(daySlot) || !isNext(daySlot) }" :key="index"
            :title="formatSlotTitle(daySlot, index)" :active-icon="isDone(daySlot) ? 'check' : 'none'">
            <div v-for="hourSlot in daySlot" :key="hourSlot._id" class="hour-slot">
              <q-item>
                <q-item-section side><q-icon name="access_time" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ formatSlotHour(hourSlot) }}</q-item-section>
              </q-item>
              <q-item v-if="hourSlot.address && hourSlot.address.fullAddress">
                <q-item-section side><q-icon name="location_on" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ hourSlot.address.fullAddress }}</q-item-section>
              </q-item>
            </div>
          </q-step>
        </q-stepper>
      </div>
    </div>
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';

export default {
  metaInfo: { title: 'Course info' },
  name: 'CourseInfo',
  data () {
    return {
      course: {},
    };
  },
  computed: {
    courseSlots () {
      return this.course.slots ? groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY')) : {};
    },
  },
  async mounted () {
    try {
      this.course = await Courses.getById(this.$route.params.courseId);
    } catch (e) {
      console.error(e);
      this.course = {};
    }
  },
  methods: {
    isDone (slot) {
      return this.$moment(slot[0].startDate).isBefore(this.$moment());
    },
    isNext (slot) {
      const nextCourses = Object.values(this.courseSlots).filter(slot => !this.isDone(slot))
        .sort((a, b) => new Date(a[0].startDate) - new Date(b[0].startDate));

      return !nextCourses.length || nextCourses[0][0]._id === slot[0]._id;
    },
    getSlotColor (slot) {
      return this.isDone(slot) ? 'grey' : 'primary';
    },
    formatSlotTitle (slot, index) {
      return `${this.$moment(slot[0].startDate).format('DD MMM YYYY')}` +
        ` - (${index + 1} / ${Object.values(this.courseSlots).length})`;
    },
    formatSlotHour (slot) {
      return `${this.$moment(slot.startDate).format('HH:mm')} - ${this.$moment(slot.endDate).format('HH:mm')}`;
    },
  },
};

</script>

<style lang="stylus" scoped>
.course
  &-header
    background-color: $primary;
    font-size: 20px;
    color: white;
  &-title
    border-bottom: 2px solid $grey-3
    text-align: center;
    &-container
      margin: 20px 8px 30px;
      display:flex
      flex-direction: row
  &-img
    height: auto;
    width: 80px;
    padding-right: 20px;

/deep/.q-stepper
  &__title
    font-size: 16px
    font-weight: bold
  &__tab
    padding: 5px 24px;
    .q-stepper__dot:after
      display: block !important

.hour-slot
  padding: 8px 0
  .q-item
    padding: 2px 10px
    min-height: 0px
    font-size: 14px
  @media screen and (min-width: 768px)
    display: flex

.opacity
  opacity: 0.6

h5
  color: $primary;
  font-weight: bold;

@media screen and (min-width: 768px)
  .course-info-title-container
    padding: 0px 125px;

  h5
    margin-bottom: 20px !important;
</style>
