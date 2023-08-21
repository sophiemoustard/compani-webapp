<template>
  <div class="container">
    <span class="title">{{ programName }}</span>
    <div class="items-container">
      <q-item v-for="info in headerInfo" :key="info.icon">
        <q-item-section side>
          <q-icon size="16px" :name="info.icon" />
        </q-item-section>
        <q-item-section>{{ info.label }}</q-item-section>
      </q-item>
    </div>
    <span class="questionnaire-type">Questionnaire de {{ questionnaireType }}</span>
  </div>
</template>

<script>
import { toRefs, computed } from 'vue';
import { composeCourseName } from '@helpers/courses';
import { useCourses } from '@composables/courses';
import { EXPECTATIONS } from '../../data/constants';

export default {
  name: 'MetaInfos',
  components: { },
  props: {
    course: { type: Object, required: true },
    questionnaire: { type: Object, required: true },
  },
  setup (props) {
    const { course, questionnaire } = toRefs(props);

    const { headerInfo } = useCourses(course);

    const programName = computed(() => composeCourseName(course.value));

    const questionnaireType = computed(() => (questionnaire.value.type === EXPECTATIONS
      ? 'recueil des attentes'
      : 'fin de formation'));

    return {
      // Computed
      programName,
      headerInfo,
      questionnaireType,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  padding: 48px
  display: flex
  flex: 1
  flex-direction: column
.title
  display: flex
  justify-content: center
  align-items: center
  font-size: 16px
  color: $copper-grey-700
.items-container
  color: $copper-grey-600
  display: flex
  flex-direction: row
  justify-content: center

.questionnaire-type
  padding: 16px 0px
  display: flex
  justify-content: center
  align-items: center
  font-size: 24px
  font-weight: bold
  color: $copper-grey-700

</style>
