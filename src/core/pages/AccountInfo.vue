<template>
  <q-page :class="backgroundClass" padding>
    <div v-if="userProfile && userProfile._id">
      <ni-title-header title="Mon compte" class="q-mb-xl" />
      <div class="q-mb-xl">
        <div class="photo-caption">Photo</div>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-picture-uploader :user="userProfile" :refresh-picture="refreshUser" />
          </div>
        </div>
      </div>
      <div class="row gutter-profile q-mb-xl">
        <ni-input caption="Prénom" :error="v$.userProfile.identity.firstname.$error"
          v-model.trim="userProfile.identity.firstname" @blur="updateUser('identity.firstname')"
          @focus="saveTmp('identity.firstname')" />
        <ni-input caption="Nom" :error="v$.userProfile.identity.lastname.$error"
          v-model.trim="userProfile.identity.lastname" @blur="updateUser('identity.lastname')"
          @focus="saveTmp('identity.lastname')" />
        <div class="col-xs-12 col-md-6 row items-center">
          <div class="col-11">
            <ni-input ref="userEmail" name="emailInput" caption="Email" type="email" :disable="emailLock"
              :error="v$.userProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-message="emailError(v$.userProfile)" v-model.trim="userProfile.local.email" />
          </div>
          <div :class="['col-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <ni-button :icon="lockIcon" @click="toggleEmailLock(!emailLock)" color="copper-grey-500" />
          </div>
        </div>
        <ni-input v-model.trim="userProfile.contact.phone" @focus="saveTmp('contact.phone')"
          error-message="Téléphone invalide." @blur="updateUser('contact.phone')" caption="Téléphone"
          :error="v$.userProfile.contact.phone.$error" />
      </div>
      <div class="account-button">
        <ni-button @click="newPasswordModal = true" color="white" class="bg-copper-500" icon="mdi-lock-reset"
          label="Modifier mon mot de passe" />
      </div>
      <q-separator class="q-my-lg" />
      <div class="account-button">
        <ni-button color="white" class="bg-copper-500 q-mb-md" @click="logout" icon="logout" label="Déconnexion" />
        <ni-button size="16px" href="https://www.compani.fr/cgu-cgv" label="Conditions générales d’utilisation"
          type="a" />
        <ni-button size="16px" type="a" href="https://www.compani.fr/rgpd" label="Politique RGPD" />
      </div>
    </div>

    <new-password-modal :confirm-error-message="passwordConfirmError(v$.newPassword.confirm)" :validations="v$"
      v-model="newPasswordModal" :user-profile="userProfile" @hide="resetForm" v-model:new-password="newPassword"
      :password-error-message="passwordError(v$.newPassword.password)" @submit="submitPasswordChange"
      :loading="loading" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required, email, sameAs } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Authentication from '@api/Authentication';
import TitleHeader from '@components/TitleHeader';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '@components/popup/notify';
import PictureUploader from '@components/PictureUploader';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { passwordMixin } from '@mixins/passwordMixin';
import { validationMixin } from '@mixins/validationMixin';
import { userMixin } from '@mixins/userMixin';
import { logOutAndRedirectToLogin } from 'src/router/redirect';
import NewPasswordModal from 'src/core/pages/NewPasswordModal';

export default {
  name: 'AccountInfo',
  metaInfo: { title: 'Mon compte' },
  mixins: [passwordMixin, validationMixin, userMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-button': Button,
    'ni-input': Input,
    'ni-picture-uploader': PictureUploader,
    'new-password-modal': NewPasswordModal,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      tmpInput: '',
      emailLock: true,
      newPasswordModal: false,
      newPassword: { password: '', confirm: '' },
      loading: false,
      backgroundClass: /\/ad\//.test(this.$router.currentRoute.value.path) ? 'vendor-background' : 'client-background',
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
        },
        contact: {
          phone: { frPhoneNumber },
        },
      },
      newPassword: {
        password: { required, ...this.passwordValidation },
        confirm: { required, sameAs: sameAs(this.newPassword.password) },
      },
    };
  },
  async beforeUnmount () {
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
        throw e;
      }
    },
    async submitPasswordChange () {
      try {
        this.loading = true;

        this.v$.newPassword.$touch();
        if (this.v$.newPassword.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, 'local.password', get(this.newPassword, 'password'));
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
      this.newPassword = { password: '', confirm: '' };
      this.v$.newPassword.$reset();
    },
    logout () {
      this.isLoggingOut = true;
      logOutAndRedirectToLogin();
    },
  },
};
</script>

<style lang="sass" scoped>
.account-button
  display: flex
  flex-direction: column
  align-items: flex-start
  @media screen and (max-width: 676px)
    align-items: center
.photo-caption
  font-size: 12px
  margin: 0 0 4px 0

</style>
