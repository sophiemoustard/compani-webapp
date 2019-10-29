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
              Les services d’Alenvi sont maintenant disponibles via le site Compani. <br> Pour vous connecter à votre compte, merci de <span class="text-weight-bold">saisir votre identifiant</span> et votre <span class="text-weight-bold">mot de passe</span>
            </p>
          </div>
        </div>
        <ni-input v-model="credentials.email" caption="Email" @keyup.enter="submit" />
        <ni-input v-model="credentials.password" caption="Mot de passe" type="password" @keyup.enter="submit" />
        <router-link class="row justify-end" :to="{ path: '/forgotPassword', query: { from: 'w' } }">
          <small>Mot de passe oublié ?</small>
        </router-link>
        <div class="row justify-center">
          <q-btn no-caps class="signup-btn" label="Me connecter" icon-right="ion-log-in" color="primary" @click="submit()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CompaniHeader from '../../components/CompaniHeader';
import Input from '../../components/form/Input';
import { NotifyNegative } from '../../components/popup/notify';
import { AUXILIARY, PLANNING_REFERENT, HELPER } from '../../data/constants.js';

export default {
  metaInfo: {
    title: 'Connexion',
    meta: [
      { name: 'description', content: 'Espace personnalisé pour accéder à vos documents et informations liés aux interventions réalisées par Alenvi.' },
    ],
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
    getUser () {
      return this.$store.getters['main/user'];
    },
    isAuxiliary () {
      return this.getUser ? this.getUser.role.name === AUXILIARY || this.getUser.role.name === PLANNING_REFERENT : false;
    },
  },
  methods: {
    async submit () {
      try {
        const user = await this.$axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
          email: this.credentials.email.toLowerCase(),
          password: this.credentials.password,
        });
        const expiresInDays = parseInt(user.data.data.expiresIn / 3600 / 24, 10) >= 1 ? parseInt(user.data.data.expiresIn / 3600 / 24, 10) : 1;
        this.$q.cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: expiresInDays, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: expiresInDays, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('user_id', user.data.data.user._id, { path: '/', expires: expiresInDays, secure: process.env.NODE_ENV !== 'development' });
        await this.$store.dispatch('main/getUser', this.$q.cookies.get('user_id'));
        if (this.$q.platform.is.desktop) {
          this.$store.commit('main/setToggleDrawer', true);
        }

        if (this.$route.query.from) {
          return this.$router.replace({ path: this.$route.query.from });
        }

        if (this.getUser.role.name === HELPER) {
          const customer = await this.$customers.getById(this.getUser.customers[0]._id);
          this.$store.commit('rh/saveUserProfile', customer);
          this.$router.replace({ name: 'customer agenda' });
        } else if (this.isAuxiliary) {
          this.$router.replace({ name: 'auxiliary agenda' });
        } else {
          this.$router.replace({ name: 'administrative directory' });
        }
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
