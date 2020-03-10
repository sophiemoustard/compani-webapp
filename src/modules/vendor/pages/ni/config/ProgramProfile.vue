<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="programName" />
    <profile-tabs :profile-id="programId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileProgram from 'src/modules/vendor/components/programs/ProfileInfo';

export default {
  name: 'ProgramProfile',
  metadata: { title: 'Fiche formation' },
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
      programName: '',
      tabsContent: [
        {
          label: 'Programme',
          name: 'program',
          default: this.defaultTab === 'program',
          component: ProfileProgram,
        },
      ],
    }
  },
  computed: {
    ...mapGetters({ program: 'program/getProgram' }),
  },
  watch: {
    program () {
      this.programName = get(this.program, 'name') || '';
    },
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
    else this.programName = '';
  },
  methods: {
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/getProgram', { programId: this.programId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.commit('program/saveProgram', null);
  },

}
</script>
