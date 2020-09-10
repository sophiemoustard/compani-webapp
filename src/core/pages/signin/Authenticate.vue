<template>
  <div>
    <compani-header />
    <div class="col-12 row justify-center client-background">
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
        <ni-input data-cy="email" v-model.trim="credentials.email" caption="Email" @keyup:enter="submit"
         :error="$v.credentials.email.$error" :error-message="emailErrorMessage" @blur="$v.credentials.email.$touch" />
        <ni-input data-cy="password" v-model="credentials.password" caption="Mot de passe" type="password"
          @keyup:enter="submit" :error="$v.credentials.password.$error" @blur="$v.credentials.password.$touch" />
        <router-link class="row justify-end" :to="{ name: 'forgotPassword' }">
          <small>Mot de passe oublié ?</small>
        </router-link>
        <div class="row justify-center">
          <ni-button data-cy="login" class="signup-btn" label="Me connecter" icon="ion-log-in" @click="submit"
            color="primary" :flat="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { NotifyNegative } from '@components/popup/notify';
import { AUXILIARY_ROLES, AUXILIARY_WITHOUT_COMPANY, REQUIRED_LABEL } from '@data/constants';
import { logInMixin } from '@mixins/logInMixin';

export default {
  metaInfo: {
    title: 'Connexion',
    meta: [{
      name: 'description',
      content: 'Espace personnalisé pour accéder à vos documents et informations liés aux interventions réalisées '
        + 'par Alenvi.',
    }],
  },
  name: 'Authentication',
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [logInMixin],
  data () {
    return {
      credentials: { email: '', password: '' },
    };
  },
  validations () {
    return {
      credentials: {
        email: { required, email },
        password: { required },
      },
    };
  },
  computed: {
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isAuxiliaryWithoutCompany () {
      return this.clientRole === AUXILIARY_WITHOUT_COMPANY;
    },
    emailErrorMessage () {
      if (!this.$v.credentials.email.required) return REQUIRED_LABEL;
      return 'Email invalide';
    },
  },
  methods: {
    async submit () {
      try {
        this.$v.credentials.$touch();
        if (this.$v.credentials.$error) return;
        await this.logInUser({ email: this.credentials.email.toLowerCase(), password: this.credentials.password });
      } catch (e) {
        console.error(e);
        if (e.response.data.statusCode) return NotifyNegative('Identifiant ou mot de passe invalide');
        NotifyNegative('Impossible de se connecter.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

  .signup
    &-bloctext-padding
      padding: 24px 0px 24px 0px
    &-body-padding
      padding: 0px 24px 0px 24px
    &-btn
      margin-top: 20px
      margin-bottom: 24px

  .client-background
    min-height: 100vh
    @media screen and (max-width: 768px)
      height: 85vh

</style>
