<template>
  <div>
    <compani-header />
    <div class="col-12 row justify-center neutral-background page-container">
      <div class="signup-body-padding">
        <div class="row items-center">
          <div class="col-2" style="text-align: left">
            <span>
              <q-icon name="thumb_up" size="2rem" /></span>
          </div>
          <div class="col-10 signup-bloctext-padding">
            <p class="no-margin" style="font-size: 0.8rem;">Afin de confirmer la création de votre compte, merci de
              <span class="text-weight-bold">choisir un mot de passe</span></p>
          </div>
        </div>
        <ni-input v-model="user.local.email" caption="Email" @blur="$v.user.local.email.$touch()"
          :error="$v.user.local.email.$error" />
        <ni-input v-model="user.local.password" caption="Mot de passe" type="password" :error-label="passwordError"
          @blur="$v.user.local.password.$touch()" :error="$v.user.local.password.$error" />
        <ni-input v-model="passwordConfirm" caption="Confirmation mot de passe" type="password"
          @blur="$v.passwordConfirm.$touch()" :error="$v.passwordConfirm.$error" :error-label="passwordConfirmError" />
        <div class="row justify-center">
          <q-btn no-caps class="signup-btn" label="Créer mon compte" icon-right="arrow_forward" color="primary"
            :loading="loading" @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs, minLength } from 'vuelidate/lib/validators';

import CompaniHeader from '../../components/CompaniHeader';
import Input from '../../components/form/Input';
import { NotifyNegative } from '../../components/popup/notify';
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'CreatePassword',
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      loading: false,
      alenviToken: '',
      user: {
        _id: '',
        local: { email: '', password: '' },
        isConfirmed: '',
      },
      passwordConfirm: '',
    }
  },
  validations () {
    return {
      user: {
        local: {
          email: { required, email },
          password: { required, minLength: minLength(4) },
        },
      },
      passwordConfirm: { required, sameAsPassword: sameAs(() => this.user.local.password) },
    }
  },
  mounted () {
    this.user.local.email = this.$q.cookies.get('signup_userEmail');
    this.user._id = this.$q.cookies.get('signup_userId');
    this.alenviToken = this.$q.cookies.get('signup_token');
  },
  computed: {
    passwordError () {
      if (!this.$v.user.local.password.required) return REQUIRED_LABEL;
      else if (!this.$v.user.local.password.minLength) return 'Mot de passe trop court';
      return 'Mot de passe invalide';
    },
    passwordConfirmError () {
      if (!this.$v.passwordConfirm.required) return REQUIRED_LABEL;
      else if (!this.$v.passwordConfirm.sameAs) return 'Le mot de passe doit être identique';
      return 'Mot de passe invalide';
    },
    secure () {
      return process.env.NODE_ENV !== 'development';
    },
  },
  methods: {
    async submit () {
      try {
        this.user.isConfirmed = true;
        await this.$users.updateById(this.user, this.alenviToken);
        this.$q.cookies.remove('signup_token', { path: '/' });
        this.$q.cookies.remove('signup_userId', { path: '/' });
        this.$q.cookies.remove('signup_userEmail', { path: '/' });
        const user = await this.$axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
          email: this.user.local.email.toLowerCase(),
          password: this.user.local.password,
        });

        const expiresInDays = parseInt(user.data.data.expiresIn / 3600 / 24, 10) >= 1
          ? parseInt(user.data.data.expiresIn / 3600 / 24, 10)
          : 1;
        this.$q.cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: expiresInDays, secure: this.secure });
        this.$q.cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: expiresInDays, secure: this.secure });
        this.$q.cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: this.secure });
        this.$q.cookies.set('user_id', user.data.data.user._id, { path: '/', expires: expiresInDays, secure: this.secure });
        await this.$store.dispatch('main/getUser', this.$q.cookies.get('user_id'));

        if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });
        this.$router.replace({ name: 'auxiliary personal info', params: { id: this.$q.cookies.get('user_id') } });
      } catch (e) {
        console.error(e);
        NotifyNegative('Echec de la mise à jour de l\'utilisateur');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>

  .signup
    &-header-padding
      padding: 24px 24px 12px 24px
    &-bloctext-padding
      padding: 24px 0px 24px 0px
    &-body-padding
      padding: 0px 24px 0px 24px
    &-btn
      font-size: 16px
      margin-top: 20px
      margin-bottom: 24px
</style>
