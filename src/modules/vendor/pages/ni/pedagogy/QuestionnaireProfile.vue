<template>
  <q-page padding class="vendor-background">
    <template v-if="questionnaire">
      <ni-profile-header :title="questionnaire.title">
        <template #body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side>
                <q-icon size="xs" :name="info.icon" :class="info.class" />
              </q-item-section>
              <q-item-section :class="info.class">{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileHeader from '@components/ProfileHeader';
import { DRAFT, QUESTIONNAIRE_TYPES } from '@data/constants';

export default {
  name: 'QuestionnaireProfile',
  props: {
    questionnaireId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
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
};
</script>

<style lang="stylus" scoped>
.info
  &-active
    color: $green-800
  &-warning
    color: $orange-500
</style>
