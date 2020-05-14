<template>
  <q-page :class="backgroungClass" padding>
    <h4>Mon compte</h4>
    <div class="center-account">
      <div class="row gutter-profile">
        <div class="col-12 col-md-6 row items-center">
          <div class="col-xs-11">
            <ni-input ref="userEmail" name="emailInput" caption="Email" type="email" :disable="emailLock"
              :error="$v.mergedUserProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-label="emailError($v.mergedUserProfile)" v-model.trim="mergedUserProfile.local.email" />
          </div>
          <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
          </div>
        </div>
        <ni-input v-model.trim="mergedUserProfile.contact.phone" caption="Téléphone" :error="$v.mergedUserProfile.contact.phone.$error"
          error-label="Téléphone invalide." @blur="updateUser('contact.phone')" @focus="saveTmp('contact.phone')" />
      </div>
      <ni-input v-model.trim="mergedUserProfile.local.password" :error="$v.mergedUserProfile.local.password.$error"
        caption="Nouveau mot de passe" :error-label="passwordError($v.mergedUserProfile.local.password)"
        @blur="$v.mergedUserProfile.local.password.$touch" type="password" :disable="isAuxiliaryWithoutCompany" />
      <ni-input v-model.trim="passwordConfirm" :error="$v.passwordConfirm.$error"
        caption="Confirmation mot de passe" :error-label="passwordConfirmError"
        @blur="$v.passwordConfirm.$touch" type="password" :disable="isAuxiliaryWithoutCompany" />
      <div class="row justify-center">
        <q-btn big @click="updateUser" color="primary" :disable="$v.$invalid || isAuxiliaryWithoutCompany">
          Éditer
        </q-btn>
      </div>
      <hr style="margin-top: 5%; margin-bottom: 5%">
      <div class="row justify-center">
        <q-btn big color="primary" @click="logout">Déconnexion</q-btn>
      </div>
      <div class="q-mt-md links">
        <div class="cursor-pointer q-mb-sm">
          <a @click.prevent="cguModal = true">Conditions générales d’utilisation</a>
        </div>
        <div class="cursor-pointer"><a @click.prevent="rgpdModal = true">Politique RGPD</a></div>
      </div>
    </div>

    <!-- RGPD modal -->
    <ni-html-modal title="Politique RGPD" v-model="rgpdModal" :html="rgpd" />

    <!-- CSU modal -->
    <ni-html-modal title="Conditions générales d’utilisation" v-model="cguModal" :html="cguCompani" />
  </q-page>
</template>

<script>
import { required, requiredIf, email, sameAs } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Input from '@components/form/Input';
import HtmlModal from '@components/modal/HtmlModal';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { AUXILIARY_WITHOUT_COMPANY } from '@data/constants';
import { passwordMixin } from '@mixins/passwordMixin';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';
import { userMixin } from '@mixins/userMixin';
import rgpd from 'src/statics/rgpd.html';
import cguCompani from 'src/statics/cguCompani.html';

export default {
  name: 'AccountInfo',
  metaInfo: { title: 'Mon compte' },
  mixins: [passwordMixin, validationMixin, userMixin],
  components: {
    'ni-input': Input,
    'ni-html-modal': HtmlModal,
  },
  data () {
    return {
      user: {
        local: { email: '', password: '' },
        contact: { phone: '' },
        fromBack: {},
        contracts: [],
      },
      mergedUserProfile: {
        local: { email: '', password: '' },
        contact: { phone: '' },
        fromBack: {},
      },
      emailLock: true,
      passwordConfirm: '',
      changePasswordModal: false,
      rgpd,
      rgpdModal: false,
      cguModal: false,
      cguCompani,
      tmpInput: '',
      backgroungClass: /\/ad\//.test(this.$router.currentRoute.path) ? 'vendor-background' : 'client-background',
    }
  },
  validations () {
    return {
      mergedUserProfile: {
        local: {
          email: { required, email },
          password: { ...this.passwordValidation },
        },
        contact: {
          phone: { frPhoneNumber },
        },
      },
      passwordConfirm: {
        required: requiredIf((item) => !!item.user.local.password),
        sameAsPassword: sameAs((item) => item.user.local.password),
      },
    }
  },
  async mounted () {
    try {
      this.mergedUserProfile.fromBack = await Users.getById(this.$route.params.id);
      this.mergedUserProfile.local.email = this.mergedUserProfile.fromBack.local.email;
      this.mergedUserProfile.contact.phone = get(this.mergedUserProfile.fromBack, 'contact.phone') || '';
    } catch (e) {
      console.error(e);
    }
  },
  computed: {
    isAuxiliaryWithoutCompany () {
      return get(this.user, 'alenvi.client.name', null) === AUXILIARY_WITHOUT_COMPANY;
    },
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateAlenviUser (path) {
      const value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);
      await Users.updateById(this.$route.params.id, payload);
    },
    logout () {
      this.$q.cookies.remove('alenvi_token', { path: '/' });
      this.$q.cookies.remove('alenvi_token_expires_in', { path: '/' });
      this.$q.cookies.remove('refresh_token', { path: '/' });
      this.$q.cookies.remove('user_id', { path: '/' });
      this.$q.localStorage.clear();

      this.$store.dispatch('course/remove');
      this.$store.dispatch('program/remove');
      this.$store.dispatch('company/remove');
      this.$store.commit('customer/saveCustomer', null);
      this.$store.commit('customer/saveNotification', null);
      this.$store.commit('rh/saveUserProfile', null);
      this.$store.commit('rh/saveNotification', null);
      this.$store.commit('planning/setFilters', []);
      this.$store.commit('planning/setElementToAdd', []);
      this.$store.commit('planning/setElementToRemove', []);

      this.$router.replace('/login');
    },
  },
}
</script>

<style lang="stylus" scoped>
  .center-account
    @media screen && (max-width: 600px)
      max-width: 100%
  .links
    display: flex
    flex-direction: column
</style>
