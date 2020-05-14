<template>
  <q-page :class="backgroungClass" padding>
    <h4>Mon compte</h4>
    <div>
      <div class="row gutter-profile q-mb-xl">
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
      <div class="row justify-center">
        <q-btn big @click="newPasswordModale = true" color="primary" icon="mdi-lock-reset"
          label="Modifier mon mot de passe" />
      </div>
      <hr class="horizontal-separator">
      <div class="row justify-center">
        <q-btn big color="primary" @click="logout" icon="logout" label="Déconnexion" />
      </div>
      <div class="q-mt-md links">
        <div class="cursor-pointer q-mb-sm">
          <a @click.prevent="cguModal = true">Conditions générales d’utilisation</a>
        </div>
        <div class="cursor-pointer"><a @click.prevent="rgpdModal = true">Politique RGPD</a></div>
      </div>
    </div>

    <!-- New password modal -->
    <ni-modal v-model="newPasswordModale" @hide="resetForm">
      <template slot="title">
        Modifier mon <span class="text-weight-bold">mot de passe</span>
      </template>
      <ni-input in-modal v-model.trim="mergedUserProfile.local.password" type="password"
        caption="Nouveau mot de passe" :error-label="passwordError($v.mergedUserProfile.local.password)" required-field
        @blur="$v.mergedUserProfile.local.password.$touch" :error="$v.mergedUserProfile.local.password.$error" />
      <ni-input in-modal v-model.trim="passwordConfirm" :error="$v.passwordConfirm.$error" type="password"
        caption="Confirmation mot de passe" :error-label="passwordConfirmError" @blur="$v.passwordConfirm.$touch"
        required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Modifier" :loading="loadingPasswordChange" color="primary"
           icon-right="done" :disable="$v.$invalid || passwordConfirm === ''" @click="submitPasswordChange" />
      </template>
    </ni-modal>

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
import Modal from '@components/modal/Modal';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
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
    'ni-modal': Modal,
  },
  data () {
    return {
      mergedUserProfile: {
        local: { email: '', password: '' },
        contact: { phone: '' },
        fromBack: {},
      },
      tmpInput: '',
      emailLock: true,
      newPasswordModale: false,
      passwordConfirm: '',
      loadingPasswordChange: false,
      rgpd,
      rgpdModal: false,
      cguModal: false,
      cguCompani,
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
        required: requiredIf((item) => !!item.mergedUserProfile.local.password),
        sameAsPassword: sameAs((item) => item.mergedUserProfile.local.password),
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
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateAlenviUser (path) {
      const value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);

      if (path === 'local.password') await Users.updatePassword(this.$route.params.id, payload);
      else await Users.updateById(this.$route.params.id, payload);
    },
    async submitPasswordChange () {
      await this.updateUser('local.password');
      this.newPasswordModale = false;
    },
    resetForm () {
      this.mergedUserProfile.local.password = '';
      this.passwordConfirm = '';
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
  .links
    display: flex
    flex-direction: column
  .horizontal-separator
    margin-top: 5%
    margin-bottom: 5%
    @media screen and (max-width: 767px)
      margin-top: calc(5% + 7px)
      margin-bottom: calc(5% + 7px)
</style>
