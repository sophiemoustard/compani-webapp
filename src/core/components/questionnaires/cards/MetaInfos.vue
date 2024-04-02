<template>
  <div class="container elm-width">
    <span class="title">{{ programName }}</span>
    <div class="items-container">
      <q-item v-for="info in headerInfo" :key="info.icon">
        <q-item-section side>
          <q-icon size="16px" :name="info.icon" />
        </q-item-section>
        <q-item-section>{{ info.label }}</q-item-section>
      </q-item>
    </div>
    <span class="questionnaire-type">Questionnaire {{ questionnaireType }}</span>
    <span v-if="displayName" class="trainee-identity">
      Vous complétez ce questionnnaire en tant que: {{ traineeName }}
    </span>
  </div>
</template>

<script>
import { toRefs, computed } from 'vue';
import { composeCourseName } from '@helpers/courses';
import { useCourses } from '@composables/courses';
import { EXPECTATIONS, END_OF_COURSE } from '@data/constants';

export default {
  name: 'MetaInfos',
  components: { },
  props: {
    course: { type: Object, required: true },
    questionnaire: { type: Object, required: true },
    traineeName: { type: String, required: true },
    displayName: { type: Boolean, default: true },
  },
  setup (props) {
    const { course, questionnaire } = toRefs(props);

    const { headerInfo } = useCourses(course);

    const programName = computed(() => (course.value.subProgram ? composeCourseName(course.value) : ''));

    const questionnaireType = computed(() => {
      switch (questionnaire.value.type) {
        case EXPECTATIONS:
          return 'de recueil des attentes';
        case END_OF_COURSE:
          return 'de fin de formation';
        default:
          return 'd\'auto-positionnement';
      }
    });

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
  display: flex
  flex-direction: column
  padding: 0 0 16px 0
.title
  @media screen and (max-width: $breakpoint-md)
    font-size: 12px
  text-align: center
  color: $copper-grey-700
.items-container
  color: $copper-grey-600
  display: flex
  flex-direction: row
  justify-content: center
  @media screen and (max-width: $breakpoint-md)
    font-size: 14px
.questionnaire-type
  padding: 16px 0px
  text-align: center
  font-weight: bold
  color: $copper-grey-700
  @media screen and (max-width: $breakpoint-md)
    font-size: 14px
.trainee-identity
  font-style: italic
  font-size: 12px
  color: $copper-grey-500
  text-align: center
</style>
