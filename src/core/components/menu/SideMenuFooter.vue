<template>
  <div class="sidemenu-footer">
    <q-item class="full-width">
      <q-item-section v-if="accessBothInterface" class="footer-logo-container" @click="switchInterface">
        <img :src="interfaceLogo" alt="go to other interface">
      </q-item-section>
      <q-item-section class="sidemenu-footer-user">{{ label }}</q-item-section>
      <div class="sidemenu-footer-icons">
        <q-item-section v-if="userCanFeedback">
          <ni-button icon="mdi-lightbulb-on-outline" color="secondary" size="sm"
            @click="openExtenalUrl('https://compani.atlassian.net/servicedesk/customer/portal/2')" />
        </q-item-section>
        <q-item-section v-if="isAuxiliaryWithCompany">
          <ni-button class="messenger" icon="mdi-facebook-messenger" color="blue" size="sm"
            @click="clickHandler" />
        </q-item-section>
        <q-item-section>
          <ni-button class="person" icon="person" @click="goToProfile" size="sm" />
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
import Button from '@components/Button';

export default {
  name: 'SideMenuFooter',
  mixins: [sideMenuMixin],
  props: {
    userId: { type: String, required: true },
    label: { type: String, default: '' },
    interfaceType: { type: String, default: CLIENT },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      interfaceLogo: 'https://storage.googleapis.com/compani-main/icons/blue_icon_small.png',
    };
  },
  computed: {
    ...mapGetters({
      clientRole: 'main/getClientRole',
      vendorRole: 'main/getVendorRole',
    }),
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
    userCanFeedback () {
      return [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT].includes(this.clientRole) ||
        [TRAINER, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    accessBothInterface () {
      return this.clientRole && this.vendorRole;
    },
  },
  methods: {
    clickHandler () {
      this.$emit('click');
    },
    openExtenalUrl (url) {
      window.open(url, '_blank');
    },
    goToProfile () {
      if (!/account/.test(this.$router.currentRoute.value.name)) {
        return /\/ad\//.test(this.$router.currentRoute.value.path)
          ? this.$router.push({ name: 'account vendor', params: { id: this.userId } })
          : this.$router.push({ name: 'account client', params: { id: this.userId } });
      }
    },
    switchInterface () {
      if (!this.accessBothInterface) return;

      if (this.interfaceType === CLIENT) this.$router.push({ path: '/ad' }).catch((e) => {});
      else this.$router.push({ path: '/' }).catch((e) => {});
    },
  },
};
</script>

<style lang="sass" scoped>
.footer-logo-container
  width: 25px
  flex: auto
  cursor: pointer

.footer-logo-container > img
  width: 25px
  height: 25px
</style>
