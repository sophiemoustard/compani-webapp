<template>
  <q-card flat>
    <q-card-section @click="$emit('click', course)">
      <p class="title-text text-weight-bold">{{ course.name }}</p>
      <div class="items-container">
        <span v-for="info in headerInfo" :key="info.icon" dense class="item-section-container">
          <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
          <q-item-section>{{ info.label }}</q-item-section>
        </span>
      </div>
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
      return formatIdentity(get(this.course, 'trainer.identity', ''), 'FL');
    },
    headerInfo () {
      return [
        { icon: 'library_books', label: `${this.programName}` },
        { icon: 'apartment', label: `${this.companyName}` },
        { icon: 'emoji_people', label: `${this.trainerName}` },
      ];
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
  .q-item__section--side
    padding: 0px
    margin: 5px;
</style>
