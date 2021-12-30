<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="programName" />
    <profile-tabs :profile-id="programId" :tabs-content="tabsContent" />
  </q-page>
</template>

<script>
import { shallowRef } from 'vue';
import get from 'lodash/get';
import { mapState } from 'vuex';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/programs/ProfileInfo';
import ProfileContent from 'src/modules/vendor/components/programs/ProfileContent';
import { createMetaMixin } from 'quasar';

const metaInfo = { title: 'Fiche programme' };

export default {
  name: 'ProgramProfile',
  props: {
    programId: { type: String, required: true },
    defaultTab: { type: String, default: 'infos' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      programName: '',
      tabsContent: [
        {
          label: 'Infos',
          name: 'infos',
          default: this.defaultTab === 'infos',
          component: shallowRef(ProfileInfo),
        },
        {
          label: 'Sous-programmes',
          name: 'content',
          default: this.defaultTab === 'content',
          component: shallowRef(ProfileContent),
        },
      ],
    };
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
  beforeUnmount () {
    // do not reset program in store if user is editing one program activity
    if (!(new RegExp(`programs/${this.program._id}`)).test(this.$route.path)) {
      this.$store.dispatch('program/resetProgram');
    }
  },

};
</script>
