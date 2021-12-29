<template>
  <q-page padding class="vendor-background column no-wrap">
    <template v-if="questionnaire">
      <ni-profile-header :title="questionnaireName" :header-info="headerInfo" />
      <profile-tabs :profile-id="questionnaireId" :tabs-content="tabsContent" class="tabs" />
    </template>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { shallowRef } from 'vue';
import { mapState } from 'vuex';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import { DRAFT, QUESTIONNAIRE_TYPES } from '@data/constants';
import ProfileEdition from 'src/modules/vendor/components/questionnaires/ProfileEdition';
import ProfileAnswers from 'src/modules/vendor/components/questionnaires/ProfileAnswers';

export default {
  name: 'QuestionnaireProfile',
  props: {
    questionnaireId: { type: String, required: true },
    defaultTab: { type: String, default: 'edition' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Édition',
          name: 'edition',
          default: this.defaultTab === 'edition',
          component: shallowRef(ProfileEdition),
        },
        {
          label: 'Réponses',
          name: 'answers',
          default: this.defaultTab === 'answers',
          component: shallowRef(ProfileAnswers),
        },
      ],
      questionnaireName: '',
    };
  },
  computed: {
    ...mapState('questionnaire', ['questionnaire']),
    headerInfo () {
      const infos = [{ icon: 'bookmark_border', label: QUESTIONNAIRE_TYPES[this.questionnaire.type] }];

      if (this.questionnaire.status === DRAFT) infos.push({ icon: 'edit', label: 'Brouillon', class: 'info-warning' });
      else infos.push({ icon: 'check_circle', label: 'Publié', class: 'info-active' });

      return infos;
    },
  },
  watch: {
    questionnaire () {
      this.questionnaireName = get(this.questionnaire, 'name') || '';
    },
  },
  async created () {
    await this.refreshQuestionnaire();
    this.questionnaireName = get(this.questionnaire, 'name') || '';
  },
  methods: {
    async refreshQuestionnaire () {
      await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.questionnaireId });
    },
  },
  beforeUnmount () {
    this.$store.dispatch('questionnaire/resetQuestionnaire');
  },
};
</script>

<style lang="sass" scoped>
.tabs
  flex: 1
</style>
