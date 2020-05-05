<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="programName" />
    <profile-tabs :profile-id="programId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/programs/ProfileInfo';

export default {
  name: 'ProgramProfile',
  metadata: { title: 'Fiche programme' },
  props: {
    programId: { type: String },
    defaultTab: { type: String, default: 'program' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      tabsContent: [
        { label: 'Programme', name: 'program', default: this.defaultTab === 'program', component: ProfileInfo },
      ],
    }
  },
  computed: {
    ...mapState('program', ['program']),
    programName () {
      return get(this.program, 'name') || '';
    },
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
  },
  methods: {
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/get', { programId: this.programId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.dispatch('program/remove');
  },

}
</script>
