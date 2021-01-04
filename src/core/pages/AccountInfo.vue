<template>
  <q-page :class="backgroundClass" padding>
    <div v-if="userProfile && userProfile._id">
      <h4>Mon compte</h4>
      <div class="q-mb-xl">
        <div class="photo-caption">Photo</div>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-picture-uploader :user="userProfile" :refresh-picture="refreshUser" />
          </div>
        </div>
      </div>
      <div class="row gutter-profile q-mb-xl">
        <ni-input caption="Prénom" :error="$v.userProfile.identity.firstname.$error"
          v-model.trim="userProfile.identity.firstname" @blur="updateUser('identity.firstname')"
          @focus="saveTmp('identity.firstname')" />
        <ni-input caption="Nom" :error="$v.userProfile.identity.lastname.$error"
          v-model.trim="userProfile.identity.lastname" @blur="updateUser('identity.lastname')"
          @focus="saveTmp('identity.lastname')" />
        <div class="col-xs-12 col-md-6 row items-center">
          <div class="col-11">
            <ni-input ref="userEmail" name="emailInput" caption="Email" type="email" :disable="emailLock"
              :error="$v.userProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-message="emailError($v.userProfile)" v-model.trim="userProfile.local.email" />
          </div>
          <div :class="['col-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <ni-button :icon="lockIcon" @click.native="toggleEmailLock(!emailLock)" color="black" />
          </div>
        </div>
        <ni-input v-model.trim="userProfile.contact.phone" @focus="saveTmp('contact.phone')"
          error-message="Téléphone invalide." @blur="updateUser('contact.phone')" caption="Téléphone"
          :error="$v.userProfile.contact.phone.$error" />
      </div>
      <div class="row account-button">
        <ni-button @click="newPasswordModal = true" color="white" icon="mdi-lock-reset"
          label="Modifier mon mot de passe" />
      </div>
      <q-separator class="q-my-lg" />
      <div class="row account-button">
        <ni-button color="white" @click="logout" icon="logout" label="Déconnexion" />
      </div>
      <div class="q-mt-lg links">
        <div class="cursor-pointer q-mb-sm">
          <a @click.prevent="cguModal = true">Conditions générales d’utilisation</a>
        </div>
        <div class="cursor-pointer"><a @click.prevent="rgpdModal = true">Politique RGPD</a></div>
      </div>
    </div>

    <new-password-modal :validations="$v" v-model="newPasswordModal" :user-profile="userProfile"
      @submit="submitPasswordChange" @hide="resetForm" :loading="loading" :password-confirm.sync="passwordConfirm"
      :password-error="passwordError($v.userProfile.local.password)" :password-confirm-error="passwordConfirmError" />

    <!-- RGPD modal -->
    <ni-html-modal title="Politique RGPD" v-model="rgpdModal" :html="rgpd" />

    <!-- CSU modal -->
    <ni-html-modal title="Conditions générales d’utilisation" v-model="cguModal" :html="cguCompani" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { required, requiredIf, email, sameAs } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Authentication from '@api/Authentication';
import Input from '@components/form/Input';
import Button from '@components/Button';
import HtmlModal from '@components/modal/HtmlModal';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '@components/popup/notify';
import PictureUploader from '@components/PictureUploader';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { passwordMixin } from '@mixins/passwordMixin';
import { validationMixin } from '@mixins/validationMixin';
import { userMixin } from '@mixins/userMixin';
import { logOutAndRedirectToLogin } from 'src/router/redirect';
import rgpd from 'src/statics/rgpd.html';
import cguCompani from 'src/statics/cguCompani.html';
import NewPasswordModal from 'src/core/pages/NewPasswordModal';

export default {
  name: 'AccountInfo',
  metaInfo: { title: 'Mon compte' },
  mixins: [passwordMixin, validationMixin, userMixin],
  components: {
    'ni-button': Button,
    'ni-input': Input,
    'ni-html-modal': HtmlModal,
    'ni-picture-uploader': PictureUploader,
    'new-password-modal': NewPasswordModal,
  },
  data () {
    return {
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
    };
  },
  validations () {
    return {
      userProfile: {
        identity: {
          firstname: { required },
          lastname: { required },
        },
        local: {
          email: { required, email },
          password: { required, ...this.passwordValidation },
        },
        contact: {
          phone: { frPhoneNumber },
        },
      },
      passwordConfirm: {
        required: requiredIf(item => !!item.userProfile.local.password),
        sameAsPassword: sameAs(item => item.userProfile.local.password),
      },
    };
  },
  async beforeDestroy () {
    if (this.isLoggingOut) this.$store.dispatch('main/resetMain');
  },
  computed: {
    ...mapState({ userProfile: state => state.main.loggedUser }),
  },
  methods: {
    async refreshUser () {
      await this.$store.dispatch('main/fetchLoggedUser', this.userProfile._id);
    },
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.userProfile, path);
    },
    async updateAlenviUser (path) {
      try {
        const value = get(this.userProfile, path);
        const payload = set({}, path, value);

        await Users.updateById(this.userProfile._id, payload);
        await this.refreshUser();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modifiation du profil');
      }
    },
    async submitPasswordChange () {
      try {
        this.loading = true;

        this.$v.userProfile.local.password.$touch();
        this.$v.passwordConfirm.$touch();
        if (this.$v.userProfile.local.password.$error || this.$v.passwordConfirm.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = get(this.userProfile, 'local.password');
        const payload = set({}, 'local.password', value);
        await Authentication.updatePassword(this.userProfile._id, payload);

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
      this.userProfile.local.password = '';
      this.passwordConfirm = '';
      this.$v.userProfile.local.password.$reset();
      this.$v.passwordConfirm.$reset();
    },
    logout () {
      this.isLoggingOut = true;
      logOutAndRedirectToLogin();
    },
  },
};
</script>

<style lang="stylus" scoped>
.links
  display: flex
  flex-direction: column
.account-button
  button
    background-color: $primary
  @media screen and (max-width: 676px)
    display: flex
    justify-content: center
.photo-caption
  font-size: 12px
  margin: 0 0 4px 0

</style>
