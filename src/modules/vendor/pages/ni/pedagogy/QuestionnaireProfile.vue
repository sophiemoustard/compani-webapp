<template>
  <q-page padding class="vendor-background">
    <template v-if="questionnaire">
      <ni-profile-header :title="questionnaire.title" :header-info="headerInfo" />
      <profile-tabs :profile-id="questionnaireId" :tabs-content="tabsContent" />
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import { DRAFT, QUESTIONNAIRE_TYPES } from '@data/constants';
import ProfileEdition from 'src/modules/vendor/components/questionnaires/ProfileEdition';

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
        { label: 'Édition', name: 'edition', default: this.defaultTab === 'edition', component: ProfileEdition },
      ],
    };
  },
  computed: {
    ...mapState('questionnaire', ['questionnaire']),
    headerInfo () {
      const infos = [{ icon: 'bookmark_border', label: QUESTIONNAIRE_TYPES[this.questionnaire.type] }];

      if (this.questionnaire.status === DRAFT) infos.push({ icon: 'edit', label: 'Brouillon', class: 'info-warning' });
      else infos.push({ icon: 'check_circle', label: 'Publiée', class: 'info-active' });

      return infos;
    },
  },
  async created () {
    await this.refreshQuestionnaire();
  },
  methods: {
    async refreshQuestionnaire () {
      await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.questionnaireId });
    },
  },
  beforeDestroy () {
    this.$store.dispatch('questionnaire/resetQuestionnaire');
  },
};
</script>
