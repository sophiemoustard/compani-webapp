<template>
  <q-page class="neutral-background" padding>
    <h4>Mon compte</h4>
    <div class="center-account">
      <ni-input v-model.trim="user.local.email" caption="Email" :error="$v.user.local.email.$error"
        error-label="Email invalide." @blur="$v.user.local.email.$touch" :disable="isAuxiliaryWithoutCompany"
        @focus="saveTmp('local.email')" />
      <ni-input v-model.trim="user.local.password" :error="$v.user.local.password.$error"
        caption="Nouveau mot de passe" :error-label="passwordError"
        @blur="$v.user.local.password.$touch" type="password" :disable="isAuxiliaryWithoutCompany" />
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
import Users from '@api/Users'
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Input from '@components/form/Input';
import HtmlModal from '@components/modal/HtmlModal';
import { AUXILIARY_WITHOUT_COMPANY } from '@data/constants';
import { passwordMixin } from '@mixins/passwordMixin';
import rgpd from 'src/statics/rgpd.html';
import cguCompani from 'src/statics/cguCompani.html';

export default {
  name: 'AccountInfo',
  metaInfo: { title: 'Mon compte' },
  mixins: [passwordMixin],
  components: {
    'ni-input': Input,
    'ni-html-modal': HtmlModal,
  },
  data () {
    return {
      user: {
        local: {
          email: '',
          password: '',
        },
        alenvi: {},
        contracts: [],
      },
      passwordConfirm: '',
      rgpd,
      rgpdModal: false,
      cguModal: false,
      cguCompani,
      tmpInput: '',
    }
  },
  validations () {
    return {
      user: {
        local: {
          email: { required, email },
          password: {
            ...this.passwordValidation,
          },
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
      this.user.alenvi = await Users.getById(this.$route.params.id);
      this.user.local.email = this.user.alenvi.local.email;
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
      if (this.tmpInput === '') this.tmpInput = get(this.user, path);
    },
    async updateUser () {
      try {
        if (this.tmpInput !== '' && this.user.local.email !== this.tmpInput) {
          await Users.updateById(this.$route.params.id, { local: { email: this.user.local.email } });
        }
        if (this.user.local.password) {
          await Users.updatePassword(this.$route.params.id, { local: { password: this.user.local.password } });
        }
        NotifyPositive('Profil modifié.');
      } catch (e) {
        NotifyNegative('Erreur lors de la modification du profil.');
        console.error(e);
      } finally {
        this.user.local.password = '';
        this.user.local.passwordConfirm = '';
        this.tmpInput = '';
      }
    },
    logout () {
      this.$q.cookies.remove('alenvi_token', { path: '/' });
      this.$q.cookies.remove('alenvi_token_expires_in', { path: '/' });
      this.$q.cookies.remove('refresh_token', { path: '/' });
      this.$q.cookies.remove('user_id', { path: '/' });
      this.$q.localStorage.clear();
      this.$router.replace('/login');
    },
  },
}
</script>

<style lang="stylus" scoped>

  .center-account
    max-width: 40%
    @media screen && (max-width: 600px)
      max-width: 100%
  .links
    display: flex
    flex-direction: column
</style>
