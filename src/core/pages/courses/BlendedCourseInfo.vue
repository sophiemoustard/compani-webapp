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
        <h5>{{ programName }}<div v-if="misc">{{ misc }}</div></h5>
      </div>
    </div>
    <div class="course-container course-stepper q-mx-sm q-my-lg">
      <p class="text-weight-bold">Dates de la formation</p>
      <q-stepper value="date" vertical flat>
        <q-step v-for="(daySlot, index) in Object.values(courseSlots)" name="date" :color="getSlotColor(daySlot)"
          :class="{ 'opacity': happened(daySlot) || !isNext(daySlot), 'next-slot': isNext(daySlot) }" :key="index"
          :title="formatSlotTitle(daySlot, index)" :active-icon="happened(daySlot) ? 'check' : 'none'">
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
      <div class="slots-to-plan" v-if="courseSlotsToPlanLength">
        Il reste {{ courseSlotsToPlanLength }} créneau{{ courseSlotsToPlanLength > 1 ? 'x' : '' }} à planifier
      </div>
    </div>
    <div class="course-container">
      <div>
        <q-item v-if="course.subProgram.program" class="row">
          <q-item-section side class="course-img-container">
              <img class="course-img course-img-explanation" :src="programImg">
          </q-item-section>
          <q-item-section class="course-item-container">
            <div class="text-weight-bold">Programme de la formation</div>
            <div class="description">{{ course.subProgram.program.learningGoals }}</div>
          </q-item-section>
        </q-item>
        <q-item v-if="course.trainer" class="row">
          <q-item-section side class="course-img-container">
              <img class="course-img course-img-explanation" :src="biographyImg">
          </q-item-section>
          <q-item-section class="course-item-container">
            <div class="text-weight-bold">Intervenant(e)</div>
            <div>{{ course.trainer.identity | formatIdentity('FL') }}</div>
            <div v-if="course.trainer.biography" class="description">"{{ course.trainer.biography }}"</div>
          </q-item-section>
        </q-item>
        <q-item v-if="course.contact" class="row">
          <q-item-section side class="course-img-container">
            <img class="course-img course-img-contact" :src="contactImg">
          </q-item-section>
          <div class="course-item-container">
            <div class="text-weight-bold">Votre contact pour la formation</div>
            <div>{{ course.contact.name }}</div>
            <div><a :href="contactPhoneLink">{{ formatPhone(course.contact.phone) }}</a></div>
            <div>
              <a v-if="course.contact.email" :href="'mailto:' + course.contact.email">{{ course.contact.email }}</a>
            </div>
          </div>
        </q-item>
        <q-item class="course-link-container">
          <a class="cursor-pointer" @click.prevent="rulesModal = true">Règlement intérieur</a>
        </q-item>
      </div>
    </div>

    <!-- Modal reglement interieur -->
    <ni-html-modal title="Règlement intérieur" v-model="rulesModal" :html="rules" />
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import Courses from '@api/Courses';
import { formatIdentity, formatPhone } from '@helpers/utils';
import HtmlModal from '@components/modal/HtmlModal';
import rules from 'src/statics/rules.html';
import { courseMixin } from '@mixins/courseMixin';

export default {
  metaInfo: { title: 'Formation' },
  name: 'BlendedCourseInfo',
  mixins: [courseMixin],
  components: {
    'ni-html-modal': HtmlModal,
  },
  data () {
    return {
      course: {},
      rulesModal: false,
      rules,
      programImg: 'https://res.cloudinary.com/alenvi/image/upload/v1587048743/images/business/Compani/'
        + 'doct-explication.png',
      biographyImg: 'https://res.cloudinary.com/alenvi/image/upload/v1587048743/images/business/Compani/'
        + 'doct-quizz.png',
      contactImg: 'https://res.cloudinary.com/alenvi/image/upload/v1587373654/images/business/Compani/'
        + 'aux-perplexite.png',
    };
  },
  computed: {
    programName () {
      return get(this.course, 'subProgram.program.name') || '';
    },
    misc () {
      return this.course.misc || '';
    },
    courseSlots () {
      return this.course.slots ? groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY')) : {};
    },
    contactPhoneLink () {
      const phoneNumber = get(this.course, 'contact.phone');
      return phoneNumber ? `tel:+33${phoneNumber.substring(1)}` : '';
    },
    courseSlotsToPlanLength () {
      return this.course.slotsToPlan.length;
    },
  },
  async created () {
    try {
      this.course = await Courses.getPublicInfosById(this.$route.params.courseId);
    } catch (e) {
      console.error(e);
      this.course = {};
    }
  },
  methods: {
    isNext (slot) {
      const nextCourses = Object.values(this.courseSlots).filter(s => !this.happened(s))
        .sort((a, b) => new Date(a[0].startDate) - new Date(b[0].startDate));

      return !nextCourses.length || nextCourses[0][0]._id === slot[0]._id;
    },
    getSlotColor (slot) {
      return this.happened(slot) ? 'grey' : 'primary';
    },
    formatSlotTitle (slot, index) {
      return `${this.$moment(slot[0].startDate).format('DD MMM YYYY')}`
        + ` - (${index + 1} / ${Object.values(this.courseSlots).length})`;
    },
    formatSlotHour (slot) {
      return `${this.$moment(slot.startDate).format('HH:mm')} - ${this.$moment(slot.endDate).format('HH:mm')}`;
    },
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
    },
    formatPhone,
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
    justify-content: center
    align-items: center
    @media screen and (min-width: 768px)
      width: 600px
  &-link-container
    display:flex
    flex-direction: column
    justify-content: flex-start
    > a
      width: fit-content
  &-header
    background-color: $primary
    font-size: 20px
    color: white
    width: 100%
  &-title
    display: flex
    flex-direction: row
    &-text
      border-bottom: 2px solid $neutral-grey
      > h5
        color: $primary
        font-weight: bold
        @media screen and (min-width: 768px)
          margin-bottom: 20px !importants
  &-img
    height: 110px
    margin-right: 10px
    &-explanation
      width: 110px
      @media screen and (max-width: 365px)
        width: 94px
        height: 94px
    &-contact
      width: 84px
      margin-left: 13px
      margin-right: 23px
      @media screen and (max-width: 365px)
        margin-left: 5px
        margin-right: 15px
    &-thumb
      width: 80px
    &-container
      display: flex
      justify-content: flex-start
  &-item-container
    max-width: min(60vw, 480px)
    @media screen and (max-width: 365px)
      max-width: 195px
  &-stepper
    display: flex
    flex-direction: column

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
      font-size: 18px
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

.description
  white-space: break-spaces;
  font-style: italic;

.slots-to-plan
  color: $primary
</style>
