<template>
  <div>
    <compani-header />
    <div class="col-12 row justify-center neutral-background" style="min-height: 100vh">
      <div class="signup-body-padding">
        <div class="row items-center">
          <div class="col-2" style="text-align: left">
            <span><q-icon name="lock" size="2rem" /></span>
          </div>
          <div class="col-10 signup-bloctext-padding">
            <p class="no-margin" style="font-size: 0.8rem">
              Les services d’Alenvi sont maintenant disponibles via le site Compani. <br> Pour vous connecter à votre
              compte, merci de <span class="text-weight-bold">saisir votre identifiant</span> et votre <span
                class="text-weight-bold">mot de passe</span>
            </p>
          </div>
        </div>
        <ni-input v-model.trim="credentials.email" caption="Email" @keyup:enter="submit" />
        <ni-input v-model="credentials.password" caption="Mot de passe" type="password" @keyup:enter="submit" />
        <router-link class="row justify-end" :to="{ path: '/forgotPassword', query: { from: 'w' } }">
          <small>Mot de passe oublié ?</small>
        </router-link>
        <div class="row justify-center">
          <q-btn no-caps class="signup-btn" label="Me connecter" icon-right="ion-log-in" color="primary"
            @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import Users from '@api/Users';
import Customers from '@api/Customers';
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import { NotifyNegative } from '@components/popup/notify';
import { HELPER, AUXILIARY_ROLES, AUXILIARY_WITHOUT_COMPANY } from '@data/constants';

export default {
  metaInfo: {
    title: 'Connexion',
    meta: [{
      name: 'description',
      content: 'Espace personnalisé pour accéder à vos documents et informations liés aux interventions réalisées par Alenvi.',
    }],
  },
  name: 'Authentication',
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      credentials: {
        email: '',
        password: '',
      },
    }
  },
  computed: {
    currentUser () {
      return this.$store.getters['current/user'];
    },
    userRole () {
      return get(this, 'currentUser.role.client.name') || null;
    },
    isAuxiliary () {
      return this.currentUser ? AUXILIARY_ROLES.includes(this.userRole) : false;
    },
    isAuxiliaryWithoutCompany () {
      return this.userRole === AUXILIARY_WITHOUT_COMPANY;
    },
  },
  methods: {
    async submit () {
      try {
        const authenticationPayload = {
          email: this.credentials.email.toLowerCase(),
          password: this.credentials.password,
        };
        const auth = await Users.authenticate(authenticationPayload);

        const expiresInDays = parseInt(auth.expiresIn / 3600 / 24, 10) >= 1
          ? parseInt(auth.expiresIn / 3600 / 24, 10)
          : 1;
        const options = { path: '/', expires: expiresInDays, secure: process.env.NODE_ENV !== 'development' };
        this.$q.cookies.set('alenvi_token', auth.token, options);
        this.$q.cookies.set('alenvi_token_expires_in', auth.expiresIn, options);
        this.$q.cookies.set('refresh_token', auth.refreshToken, { ...options, expires: 365 });
        this.$q.cookies.set('user_id', auth.user._id, options);
        await this.$store.dispatch('current/getUser', this.$q.cookies.get('user_id'));

        if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });

        if (this.userRole === HELPER) {
          const customer = await Customers.getById(this.currentUser.customers[0]._id);
          this.$store.commit('rh/saveUserProfile', customer);
          this.$router.replace({ name: 'customer agenda' });
        } else if (this.isAuxiliaryWithoutCompany) {
          this.$router.replace({ name: 'account info', params: { id: this.currentUser._id } });
        } else if (this.isAuxiliary) this.$router.replace({ name: 'auxiliary agenda' });
        else this.$router.replace({ name: 'auxiliaries directory' });
      } catch (e) {
        NotifyNegative('Impossible de se connecter.');
        console.error(e);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>

  .signup
    &-bloctext-padding
      padding: 24px 0px 24px 0px
    &-body-padding
      padding: 0px 24px 0px 24px
    &-btn
      font-size: 16px
      margin-top: 20px
      margin-bottom: 24px

  .neutral-background
    @media screen and (max-width: 768px)
      height: 85vh

</style>
