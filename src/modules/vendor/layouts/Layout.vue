<template>
  <q-layout view="hhh Lpr lff">
    <q-drawer :mini="isMini" :mini-width="30" :width="250" side="left" :value="drawer" @input="toggleMenu">
      <side-menu-admin ref="adminMenu" v-if="!isMini && isAdmin" />
      <side-menu-trainer ref="trainerMenu" v-if="!isMini && isTrainer" />
      <div :class="chevronContainerClasses" >
        <q-btn :class="chevronClasses" dense round unelevated :icon="menuIcon" @click="isMini = !isMini" />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>
    <q-page-sticky v-if="$q.platform.is.mobile" position="bottom-left" :offset="[18, 18]">
      <q-btn class="menu-icon" color="primary" round dense @click="toggleMenu(true)" icon="menu" />
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex';
import { layoutMixin } from '@mixins/layoutMixin';
import { TRAINER, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';
import SideMenuAdmin from 'src/modules/vendor/components/menu/SideMenuAdmin';
import SideMenuTrainer from 'src/modules/vendor/components/menu/SideMenuTrainer';

export default {
  metaInfo: {
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/' +
          'compani_burgundy_32.png',
      },
    ],
  },
  components: {
    'side-menu-admin': SideMenuAdmin,
    'side-menu-trainer': SideMenuTrainer,
  },
  mixins: [layoutMixin],
  computed: {
    ...mapGetters({ vendorRole: 'main/vendorRole' }),
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    sidemenusRefs () {
      if (!this.loggedUser) return 'defaultMenu';

      if (this.isAdmin) return 'adminMenu';
      if (this.isTrainer) return 'trainerMenu';

      return 'defaultMenu';
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-page-sticky
    z-index: 10
    @media (min-width: 1025px)
      display: none;

  .chevron
    background-color: white
    border: 1px solid $light-grey
    top: 5px
    position: fixed
    z-index: 5000
    &-left
      left: 235px
    &-right
      left: 15px
    @media (max-width: 1024px)
      display: none

  .q-toolbar
    color: $primary

  .q-btn
    color: $dark-grey
    &:hover
      color: $primary

  .menu-icon
    font-size: 17px;
</style>
