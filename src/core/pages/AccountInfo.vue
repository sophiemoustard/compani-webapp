<template>
  <q-page :class="backgroundClass" padding>
    <h4>Mon compte</h4>
      <div class="row gutter-profile q-mb-xl">
        <div class="col-xs-12 col-md-6 row items-center">
          <div class="col-11">
            <ni-input ref="userEmail" name="emailInput" caption="Email" type="email" :disable="emailLock"
              :error="$v.mergedUserProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-label="emailError($v.mergedUserProfile)" v-model.trim="mergedUserProfile.local.email" />
          </div>
          <div :class="['col-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
          </div>
        </div>
        <ni-input v-model.trim="mergedUserProfile.contact.phone" @focus="saveTmp('contact.phone')"
          error-label="Téléphone invalide." @blur="updateUser('contact.phone')" caption="Téléphone"
          :error="$v.mergedUserProfile.contact.phone.$error" />
      </div>
      <div class="row button">
        <q-btn big @click="newPasswordModal = true" color="primary" icon="mdi-lock-reset"
          label="Modifier mon mot de passe" />
      </div>
      <hr class="q-my-lg">
      <div class="row button">
        <q-btn big color="primary" @click="logout" icon="logout" label="Déconnexion" />
      </div>
      <div class="q-mt-lg links">
        <div class="cursor-pointer q-mb-sm">
          <a @click.prevent="cguModal = true">Conditions générales d’utilisation</a>
        </div>
        <div class="cursor-pointer"><a @click.prevent="rgpdModal = true">Politique RGPD</a></div>
      </div>

    <!-- New password modal -->
    <ni-modal v-model="newPasswordModal" @hide="resetForm">
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
        <q-btn no-caps class="full-width modal-btn" label="Modifier" color="primary" :loading="loading"
          :disable="$v.mergedUserProfile.local.password.$invalid || $v.passwordConfirm.$invalid" icon-right="done"
          @click="submitPasswordChange" />
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
import pick from 'lodash/pick';
import Users from '@api/Users';
import Input from '@components/form/Input';
import HtmlModal from '@components/modal/HtmlModal';
import Modal from '@components/modal/Modal';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '@components/popup/notify';
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
      },
      tmpInput: '',
      emailLock: true,
      newPasswordModal: false,
      passwordConfirm: '',
      loading: false,
      rgpd,
      rgpdModal: false,
      cguModal: false,
      cguCompani,
      backgroundClass: /\/ad\//.test(this.$router.currentRoute.path) ? 'vendor-background' : 'client-background',
      isLoggingOut: false,
    }
  },
  validations () {
    return {
      mergedUserProfile: {
        local: {
          email: { required, email },
          password: { required, ...this.passwordValidation },
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
  async created () {
    try {
      const user = await Users.getById(this.$route.params.id);
      this.mergedUserProfile = { contact: {}, ...pick(user, ['local.email', 'contact']) };
    } catch (e) {
      console.error(e);
    }
  },
  async beforeDestroy () {
    if (this.isLoggingOut) this.$store.dispatch('main/reset');
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
    async submitPasswordChange () {
      try {
        this.loading = true;

        this.$v.mergedUserProfile.local.password.$touch();
        this.$v.passwordConfirm.$touch();
        if (this.$v.mergedUserProfile.local.password.$error || this.$v.passwordConfirm.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = get(this.mergedUserProfile, 'local.password');
        const payload = set({}, 'local.password', value);
        await Users.updatePassword(this.$route.params.id, payload);

        NotifyPositive('Modification enregistrée.');
        this.newPasswordModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.loading = false;
      }
    },
    resetForm () {
      this.mergedUserProfile.local.password = '';
      this.passwordConfirm = '';
      this.$v.mergedUserProfile.local.password.$reset();
      this.$v.passwordConfirm.$reset();
    },
    logout () {
      this.isLoggingOut = true;
      this.$q.cookies.remove('alenvi_token', { path: '/' });
      this.$q.cookies.remove('alenvi_token_expires_in', { path: '/' });
      this.$q.cookies.remove('refresh_token', { path: '/' });
      this.$q.cookies.remove('user_id', { path: '/' });
      this.$q.localStorage.clear();

      this.$store.dispatch('course/reset');
      this.$store.dispatch('program/reset');
      this.$store.dispatch('company/reset');
      this.$store.dispatch('customer/reset');
      this.$store.dispatch('rh/resetRh');
      this.$store.dispatch('planning/reset');

      this.$router.replace('/login');
    },
  },
}
</script>

<style lang="stylus" scoped>
.links
  display: flex
  flex-direction: column
.button
  @media screen and (max-width: 676px)
    display: flex
    justify-content: center
</style>
