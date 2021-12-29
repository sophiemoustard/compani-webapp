<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <auxiliary-profile-header :profile-id="auxiliaryId" :title="auxiliaryName" />
      <profile-tabs :profile-id="auxiliaryId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import get from 'lodash/get';
import AuxiliaryProfileHeader from 'src/modules/client/components/auxiliary/AuxiliaryProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';
import ProfileContracts from 'src/modules/client/components/auxiliary/ProfileContracts';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

const metaInfo = { title: 'Fiche auxiliaire' };

export default {
  name: 'AuxiliaryProfile',
  props: {
    auxiliaryId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'auxiliary-profile-header': AuxiliaryProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      tabsContent: [
        {
          label: 'Infos personnelles',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
          notification: 'profiles',
        },
        { label: 'Contrats', name: 'contracts', default: this.defaultTab === 'contracts', component: ProfileContracts },
        { label: 'Paie', name: 'pays', default: this.defaultTab === 'pays', component: ProfilePay },
      ],
      auxiliaryName: '',
    };
  },
  async created () {
    await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.auxiliaryId });
    this.refreshAuxiliaryName();
  },
  computed: {
    ...mapState('userProfile', ['userProfile', 'notifications']),
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('userProfile/updateNotifications');
    },
    'userProfile.identity': function () {
      this.refreshAuxiliaryName();
    },
  },
  methods: {
    refreshAuxiliaryName () {
      this.auxiliaryName = get(this.userProfile, 'identity')
        ? `${this.userProfile.identity.firstname} ${this.userProfile.identity.lastname}`
        : '';
    },
  },
  beforeUnmount () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
