<template>
  <q-card flat>
    <q-card-section @click="$emit('click', course)">
      <div class="title-text text-weight-bold">{{ course.name }}</div>
      <div class="items-container">
        <q-item v-for="info in headerInfo" :key="info.icon" class="item-section-container text-weight-bold">
          <q-item-section side>
            <q-icon size="12px" :name="info.icon" />
          </q-item-section>
          <q-item-section>{{ info.label }}</q-item-section>
        </q-item>
      </div>
      <q-item class="infos-course-container">
        <q-item-section>
          <q-icon size="xs" :name="formatNearestDate.icon" />
          <q-item-label class="infos-course-nearest-date">{{ formatNearestDate.label }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="infos-course-container text-weight-bold">
        <q-item-section>
          <q-icon size="xs" name="mdi-account-multiple" />
          <q-item-label>({{ traineesCount }})</q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="infos-course-container text-weight-bold">
        <q-item-section side>
          <q-icon size="xs" name="mdi-calendar-range" />
          <q-item-label>({{ courseSlotsCount }})</q-item-label>
        </q-item-section>
        <q-item-section>
          <div class="row fit q-gutter-xs">
            <div v-for="(slot, index) in course.slots" :key="index"
              :class="['col-3', 'slots', { 'slots-happened': happened(slot) }]" />
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<script>
import get from 'lodash/get';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'CourseDetail',
  mixins: [courseMixin],
  props: {
    course: { type: Object, default: () => ({}) },
  },
  computed: {
    traineesCount () {
      return get(this.course, 'trainees.length') || 0;
    },
    courseSlotsCount () {
      return this.course.slots.length;
    },
    formatNearestDate () {
      if (this.courseSlotsCount === 0) return { label: 'Pas de date prévue', icon: 'mdi-calendar-remove' };

      if (this.course.slots.every((daySlots) => !this.happened(daySlots))) {
        const firstSlot = this.course.slots[0];
        const rangeToNextDate = this.$moment(firstSlot[0].startDate).diff(this.$moment().startOf('day'), 'd');

        return {
          label: rangeToNextDate ? `Commence dans ${rangeToNextDate} jour(s)` : 'Commence aujourd’hui',
          icon: 'img:statics/calendar-arrow-right.svg',
        };
      }

      if (this.course.slots.every(this.happened)) {
        const lastSlot = this.course.slots[this.course.slots.length - 1];
        const rangeToLastDate = this.$moment().endOf('day').diff(this.$moment(lastSlot[0].startDate), 'd');

        return {
          label: rangeToLastDate ? `Dernière date il y a ${rangeToLastDate} jour(s) ` : 'Dernière date aujourd’hui',
          icon: 'img:statics/calendar-arrow-left.svg',
        };
      }

      const nextSlot = this.course.slots.filter((daySlots) => !this.happened(daySlots))[0];
      const rangeToNextDate = this.$moment(nextSlot[0].startDate).diff(this.$moment().startOf('day'), 'd');

      return {
        label: rangeToNextDate ? `Prochaine date dans ${rangeToNextDate} jour(s)` : 'Prochaine date aujourd’hui',
        icon: 'img:statics/calendar-arrow-right.svg',
      };
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
  .infos-course
    &-nearest-date
      color: $primary !important;
    &-container
      align-items: center;
      font-size: 14px;
      margin-top: 10px;
      & > .q-item__section
        display: flex;
        justify-content: flex-start;
        flex-direction: row;
        color: black;
        &.q-item__section--side
          margin-right: 10px
        & > .q-icon
          margin-right: 10px;
  .slots
    height: 10px;
    flex: 0 1 calc(25% - 4px);
    background-color: $primary-light;
    &-happened
      background-color: $primary;
</style>
