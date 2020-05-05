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
        <ni-input data-cy="email" v-model.trim="credentials.email" caption="Email" @keyup:enter="submit" />
        <ni-input data-cy="password" v-model="credentials.password" caption="Mot de passe" type="password"
          @keyup:enter="submit" />
        <router-link class="row justify-end" :to="{ name: 'forgotPassword' }">
          <small>Mot de passe oublié ?</small>
        </router-link>
        <div class="row justify-center">
          <q-btn data-cy="login" no-caps class="signup-btn" label="Me connecter" icon-right="ion-log-in" color="primary"
            @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import { NotifyNegative } from '@components/popup/notify';
import { AUXILIARY_ROLES, AUXILIARY_WITHOUT_COMPANY } from '@data/constants';
import { logInMixin } from '@mixins/logInMixin';

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
  mixins: [logInMixin],
  data () {
    return {
      credentials: { email: '', password: '' },
    }
  },
  computed: {
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isAuxiliaryWithoutCompany () {
      return this.clientRole === AUXILIARY_WITHOUT_COMPANY;
    },
  },
  methods: {
    async submit () {
      try {
        await this.logInUser({ email: this.credentials.email.toLowerCase(), password: this.credentials.password });
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
