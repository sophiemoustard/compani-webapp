<template>
  <div class="profile-tabs">
    <q-tabs align="justify" color="transparent" text-color="primary">
      <q-tab v-for="(tab, index) in tabsContent" :key="index" :label="tab.label"
        :name="tab.name" :alert="alert(tab)"/>
    </q-tabs>
    <q-tab-panels v-model="selectedTab" class="no-border neutral-background" flat>
      <!-- Dynamic component loading  -->
      <q-tab-panel v-for="(tab, index) in tabsContent" :name="tab.name"  :key="index">
        <component v-if="tab.name === 'info'" :is="tab.component" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
export default {
  name: 'ProfileTabs',
  props: ['tabsContent', 'profileId'],
  data () {
    return {
      selectedTab: 'info',
    }
  },
  computed: {
    notifications () {
      return this.$store.getters['rh/getNotifications'];
    },
  },
  methods: {
    alert (tab) {
      return tab.notification && this.notifications[tab.notification][this.profileId]
        ? this.notifications[tab.notification][this.profileId]
        : false
    },
  },
}
</script>

<style lang="stylus" scoped>
  .profile-tabs
    & /deep/ .q-tabs
      &-scroller
        & div:nth-last-child(2)
          margin-right: 0 !important
        & .q-tab
          flex: 1 1 0
          margin-right: 24px
      &-normal
        & .q-tab-label
          color: $dark-grey
          opacity: 1
      & .q-tabs-panes .q-tab-pane
        padding: 0
        padding-top: 24px
      & > .q-tabs-head
        font-size: 24px
        &:not(.scrollable)
          @media (min-width: 992px)
            padding: 0
        & .q-tab
          text-transform: none
          align-items: start
          &:before
            background: none
          &.active
            & .q-tab-label
              color: $primary
              font-weight: 700
            & .q-tabs-bar
              color: inherit
          @media (min-width: 992px)
            padding-left: 0
          & .q-tabs-bar
            display: block !important
            color: $light-grey
          & .q-dot
            background: $secondary
</style>
