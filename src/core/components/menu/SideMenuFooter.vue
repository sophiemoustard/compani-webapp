<template>
  <div class="sidemenu-footer">
    <q-item class="full-width">
      <q-item-section v-if="accessBothInterface" class="footer-logo-container" @click.native="switchInterface">
        <img :src="interfaceLogo" alt="go to other interface" >
      </q-item-section>
      <q-item-section class="sidemenu-footer-user">{{ label }}</q-item-section>
      <div class="sidemenu-footer-icons">
        <q-item-section v-if="userCanFeedback">
          <q-icon size="xs" name="mdi-lightbulb-on-outline" class="feedback"
            @click.native="openExtenalUrl('https://compani.atlassian.net/servicedesk/customer/portal/2')" />
        </q-item-section>
        <q-item-section v-if="isAuxiliaryWithCompany">
          <q-icon size="xs" class="messenger" name="mdi-facebook-messenger"
            @click.native="clickHandler" />
        </q-item-section>
        <q-item-section>
          <q-icon size="xs" class="person" name="person" @click.native="goToProfile" />
        </q-item-section>
      </div>
    </q-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  COACH_ROLES,
  AUXILIARY,
  PLANNING_REFERENT,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
  TRAINER,
  CLIENT,
} from '@data/constants';
import { sideMenuMixin } from '@mixins/sideMenuMixin';

export default {
  name: 'SideMenuFooter',
  mixins: [sideMenuMixin],
  props: {
    userId: { type: String, required: true },
    label: { type: String, default: '' },
    interfaceType: { type: String, default: CLIENT },
  },
  computed: {
    ...mapGetters({
      clientRole: 'main/clientRole',
      vendorRole: 'main/vendorRole',
    }),
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
    userCanFeedback () {
      return [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT].includes(this.clientRole) ||
        [TRAINER, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    interfaceLogo () {
      return this.interfaceType === CLIENT
        ? 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_burgundy_32.png'
        : 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_rose_32.png';
    },
  },
  methods: {
    clickHandler () {
      this.$emit('myClick');
    },
    openExtenalUrl (url) {
      window.open(url, '_blank');
    },
    goToProfile () {
      if (!/account info/.test(this.$router.currentRoute.name)) {
        return /\/ad\//.test(this.$router.currentRoute.path)
          ? this.$router.push({ name: 'vendor account info', params: { id: this.userId } })
          : this.$router.push({ name: 'client account info', params: { id: this.userId } });
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.footer-logo-container
  width: 25px
  flex: auto
  cursor: pointer

.footer-logo-container > img
  width: 25px
  height: 25px

</style>
