<template>
  <div class="course">
    <div class="row col-12 q-pa-md course-header items-center justify-center text-weight-bold">
      <div>Votre formation Compani</div>
    </div>
    <div class="course-container course-title q-mx-sm q-my-lg">
      <img class="course-img course-img-thumb"
        src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/aux-pouce.png">
      <div class="course-title-text">
        <div class="text-weight-bold">Vous êtes convoqué(e) à la formation</div>
        <h5>{{ course.name }}</h5>
      </div>
    </div>
    <div class="course-container course-stepper q-mx-sm q-my-lg">
      <p class="text-weight-bold q-pl-xl">Dates de la formation</p>
      <q-stepper value="date" vertical flat>
        <q-step v-for="(daySlot, index) in Object.values(courseSlots)" name="date" :color="getSlotColor(daySlot)"
          :class="{ 'opacity': isDone(daySlot) || !isNext(daySlot), 'next-slot': isNext(daySlot) }" :key="index"
          :title="formatSlotTitle(daySlot, index)" :active-icon="isDone(daySlot) ? 'check' : 'none'">
          <div v-for="hourSlot in daySlot" :key="hourSlot._id" class="hour-slot">
            <q-item>
              <q-item-section side><q-icon name="access_time" flat dense size="xs" /></q-item-section>
              <q-item-section>{{ formatSlotHour(hourSlot) }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section side><q-icon name="location_on" flat dense size="xs" /></q-item-section>
              <q-item-section>{{ getSlotAddress(hourSlot) }}</q-item-section>
            </q-item>
          </div>
        </q-step>
      </q-stepper>
    </div>
    <div v-if="course.trainer" class="course-container course-trainer q-mx-sm q-my-lg">
      <img class="course-img course-img-explanation"
        src="https://res.cloudinary.com/alenvi/image/upload/v1587048743/images/business/Compani/doct-explication.png" />
      <div>
        <div class="text-weight-bold">Intervenant(e)</div>
        <div>{{ course.trainer.identity | formatIdentity('FL') }}</div>
        <div v-if="course.trainer.biography" class="biography">"{{ course.trainer.biography }}"</div>
      </div>
    </div>
    <div class="q-mx-sm q-my-lg course-container cursor-pointer">
      <a @click.prevent="rulesModal = true" >Règlement intérieur</a>
    </div>

    <!-- Modal reglement interieur -->
    <ni-html-modal title="Règlement intérieur" v-model="rulesModal" :html="rules" />
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import Courses from '@api/Courses';
import { formatIdentity } from '@helpers/utils';
import HtmlModal from '@components/modal/HtmlModal';
import rules from 'src/statics/rules.html';

export default {
  metaInfo: { title: 'Formation' },
  name: 'CourseInfo',
  components: {
    'ni-html-modal': HtmlModal,
  },
  data () {
    return {
      course: {},
      rulesModal: false,
      rules,
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
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
    },
  },
  filters: {
    formatIdentity,
  },
};

</script>

<style lang="stylus" scoped>
.course
  display: flex
  flex-direction: column
  @media screen and (min-width: 768px)
    align-items: center
  &-container
    display:flex
    flex-direction: column
    @media screen and (min-width: 768px)
      width: 600px
  &-header
    background-color: $primary
    font-size: 20px
    color: white
    width: 100%
  &-title
    display: flex
    flex-direction: row
    &-text
      border-bottom: 2px solid $grey-3
  &-img
    height: 110px
    margin-right: 10px
    &-explanation
      width: 110px
    &-thumb
      width: 80px
  &-stepper
    display: flex
    flex-direction: column
  &-trainer
    display: flex
    flex-direction: row
.biography
  font-style: italic

/deep/.q-stepper
  &__title
    font-size: 16px
    font-weight: bold
  &__tab
    padding: 5px 24px
    .q-stepper__dot:after
      display: block !important
  &__dot
    height: 20px
    width: 20px
    min-width: 20px

.next-slot
  /deep/.q-stepper
    &__title
      font-size:18px
    &__dot
      height: 24px
      width: 24px
      box-shadow: 1px 1px 2px grey

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

.course-title-text > h5
  color: $primary
  font-weight: bold

@media screen and (min-width: 768px)
  .course-info-title-container
    padding: 0px 125px

  .course-title-text > h5
    margin-bottom: 20px !important
</style>
