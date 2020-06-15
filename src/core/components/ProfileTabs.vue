<template>
  <div class="profile-tabs">
    <q-tabs align="justify" color="transparent" text-color="primary" v-model="selectedTab">
      <q-tab v-for="(tab, index) in tabsContent" :key="index" :label="tab.label"
        :name="tab.name" :alert="alert(tab)"/>
    </q-tabs>
    <q-tab-panels v-model="selectedTab" class="no-border" flat>
      <q-tab-panel v-for="(tab, index) in tabsContent" :name="tab.name" :key="index">
        <component :is="tab.component" :profile-id="profileId" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
export default {
  name: 'ProfileTabs',
  props: {
    tabsContent: { type: Array, default: () => [] },
    profileId: { type: String, default: '' },
    notifications: { type: Object, default: () => {} },
  },
  data () {
    return {
      selectedTab: null,
    }
  },
  mounted () {
    const selectedTab = this.tabsContent.find(tab => tab.default);
    this.selectedTab = selectedTab.name;
  },
  methods: {
    alert (tab) {
      return tab.notification && this.notifications && this.notifications[tab.notification][this.profileId]
        ? this.notifications[tab.notification][this.profileId]
        : false
    },
  },
}
</script>

<style lang="stylus" scoped>
  .profile-tabs
    /deep/ .q-tab--active
      & > .q-tab__indicator
        color: $primary
    /deep/.q-tab__indicator
      color: $middle-grey
      opacity: 1
    & /deep/.q-tab-panels
      background-color: inherit
      .scroll
        overflow: initial
      .q-panel
        .q-tab-panel
          padding: 0
          padding-top: 24px
    & /deep/ .q-tabs
      & div:nth-last-child(1)
        margin-right: 0 !important
      & .q-tabs__content
        &:not(.scrollable)
          @media (min-width: 992px)
            padding: 0
        & .q-tab
          flex: 1 1 0
          padding-left: 0px
          justify-content: start
          margin-right: 24px
          text-transform: none
          @media (max-width: 767px)
            max-width: 66%
          @media (min-width: 768px)
            max-width: 33%
          & .q-tab__content
            & .q-tab__label
              color: $dark-grey
              font-size: 24px
            & .q-tab__alert
              background: $secondary
          &:before
            background: none
        & .q-tab--active
          & .q-tab__content
            & .q-tab__label
              color: $primary
              font-weight: 700
</style>
