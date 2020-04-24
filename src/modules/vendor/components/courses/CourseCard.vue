<template>
  <q-card flat>
    <q-card-section @click="$emit('click', course)">
      <div class="title-text text-weight-bold">{{ course.name }}</div>
      <div class="items-container">
        <q-item v-for="info in headerInfo" :key="info.icon" class="item-section-container text-weight-bold">
          <q-item-section side><q-icon size="12px" :name="info.icon"/></q-item-section>
          <q-item-section>{{ info.label }}</q-item-section>
        </q-item>
      </div>
      <q-item class="infos-course-container text-weight-bold">
        <q-item-section><q-icon size="xs" :name="formatNearestDate.icon" />
          <div class="info-course-next-date-text"> {{ formatNearestDate.label }} </div>
        </q-item-section>
      </q-item>
      <q-item class="infos-course-container text-weight-bold">
        <q-item-section><q-icon size="xs" name="people"/> ({{ traineesCount }}) </q-item-section>
      </q-item>
      <q-item class="infos-course-container text-weight-bold">
        <q-item-section><q-icon size="xs" name="date_range"/> ({{ courseSlotsCount }}) </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<script>
import get from 'lodash/get';
import { courseMixin } from '../../mixins/courseMixin';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'CourseDetail',
  mixins: [courseMixin],
  props: {
    course: { type: Object, default: () => ({}) },
  },
  computed: {
    trainerName () {
      return formatIdentity(get(this.course, 'trainer.identity'), 'FL');
    },
    traineesCount () {
      return get(this.course, 'trainees.length') || 0;
    },
    courseSlotsCount () {
      return this.course.slots.length;
    },
    headerInfo () {
      return [
        { icon: 'library_books', label: `${this.programName}` },
        { icon: 'apartment', label: `${this.companyName}` },
        { icon: 'emoji_people', label: `${this.trainerName}` },
      ];
    },
    formatNearestDate () {
      if (this.courseSlotsCount === 0) {
        return { label: 'Pas de date prévue', icon: 'img:statics/calendar-arrow-right.svg' };
      }

      if (this.course.slots.every((daySlots) => !this.happened(daySlots))) {
        const firstSlot = this.course.slots[0];
        const rangeToNextDate = this.$moment(firstSlot[0].startDate).diff(this.$moment().startOf('day'), 'd');
        return {
          label: `Commence dans ${rangeToNextDate} jour(s)`,
          icon: 'img:statics/calendar-arrow-right.svg',
        };
      }
      if (this.course.slots.every(this.happened)) {
        const lastSlot = this.course.slots[this.course.slots.length - 1];
        const rangeToLastDate = this.$moment().endOf('day').diff(this.$moment(lastSlot[0].startDate), 'd');
        return {
          label: `Dernière date il y a ${rangeToLastDate} jour(s) `,
          icon: 'img:statics/calendar-arrow-left.svg',
        };
      }
      const nextSlot = this.course.slots.filter((daySlots) => !this.happened(daySlots))[0];
      const rangeToNextDate = this.$moment(nextSlot[0].startDate).diff(this.$moment().startOf('day'), 'd');
      if (rangeToNextDate === 0) {
        return { label: 'Prochaine date aujourd’hui', icon: 'img:statics/calendar-arrow-right.svg' };
      }
      return {
        label: `Prochaine date dans ${rangeToNextDate} jour(s)`,
        icon: 'img:statics/calendar-arrow-right.svg',
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-card__section
    font-size: 13px
    height: fit-content
    &:hover
      cursor: pointer
    &--vert
      padding: 10px
  .title-text
    font-size: 14px;
  .items-container
    display: flex;
    flex-wrap: wrap;
  .item-section-container
    display: flex;
    color: $grey;
    font-size: 12px;
  .q-item__section--side
    padding: 0px;
    margin-right: 5px;
  .q-item
    padding: 0px;
    min-height: auto;
    margin-right: 10px;
  .infos-course-container
    display: flex;
    font-size: 14px;
    margin-top: 10px;
  .infos-course-container > .q-item__section
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
  .infos-course-container > .q-item__section > .q-icon
    margin-right: 10px;
  .info-course-next-date-text
    color: $primary
</style>
