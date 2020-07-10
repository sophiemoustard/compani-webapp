<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="programName" />
    <profile-info :profile-id="programId" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
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
    'profile-info': ProfileInfo,
  },
  data () {
    return {
      programName: '',
    }
  },
  computed: {
    ...mapState('program', ['program']),
  },
  watch: {
    program () {
      this.programName = get(this.program, 'name') || '';
    },
  },
  async created () {
    if (!this.program) await this.refreshProgram();
    this.programName = get(this.program, 'name') || '';
  },
  methods: {
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.dispatch('program/resetProgram');
  },

}
</script>
