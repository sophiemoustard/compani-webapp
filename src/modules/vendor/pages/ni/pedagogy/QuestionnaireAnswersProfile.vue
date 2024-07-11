<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header title="Réponses aux questionnaires">
      <template #title>
        <ni-select class="selector" :model-value="questionnaireType" @update:model-value="updateQuestionnaireType"
          caption="Type de questionnaire"
          :options="questionnaireOptions" clearable />
      </template>
    </ni-profile-header>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import { QUESTIONNAIRE_TYPES, SELF_POSITIONNING } from '@data/constants';

export default {
  name: 'QuestionnaireAnswersProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-select': Select,
  },
  props: {
  },
  setup () {
    const questionnaireType = ref('');

    const questionnaireOptions = Object.keys(QUESTIONNAIRE_TYPES)
      .filter(type => type !== SELF_POSITIONNING)
      .map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type }));

    const updateQuestionnaireType = (value) => { questionnaireType.value = value; };

    return {
      // Data
      questionnaireType,
      // Computed
      questionnaireOptions,
      // Methods
      updateQuestionnaireType,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector
  width: 40%
</style>
