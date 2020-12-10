<template>
  <div>
    <compani-header />
    <div class="row justify-center q-layout-padding client-background page-container">
      <div class="col-md-6 col-xs-12">
        <div class="q-mb-lg message">
          Nous allons vous envoyer un email pour réinitialiser votre mot de passe.
          Veuillez renseigner votre adresse email.
        </div>
        <ni-input caption="Email" :error="$v.email.$error" v-model.trim="email" @blur="$v.email.$touch"
          error-message="Veuillez rentrer un email valide. (ex: mail@mail.com)" required-field />
        <div class="row justify-center">
          <q-btn class="btn-submit" @click="submit" color="primary" :disable="$v.email.$invalid" big>Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators';
import Users from '@api/Users';
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { refreshAlenviCookies } from '@helpers/alenvi';
import { Cookies } from 'quasar';
import store from 'src/store/index';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      email: '',
    };
  },
  validations: {
    email: { email, required },
  },
  async beforeRouteEnter (to, from, next) {
    const refresh = await refreshAlenviCookies();
    if (refresh) {
      await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

      const loggedUser = store.getters['main/getLoggedUser'];
      if (loggedUser) next({ path: '/' });
      else {
        await Users.logOut();
        next();
      }
    } else next();
  },
  methods: {
    async submit () {
      try {
        const payload = { email: this.email.toLowerCase() };
        await Users.forgotPassword(payload);
        NotifyPositive('Un email a été envoyé à l\'adresse indiquée');
      } catch (e) {
        let content = '';
        if (e.response && e.response.status) {
          if (e.response.status === 400) {
            content = 'Veuillez remplir le champ email.';
          } else if (e.response.status === 404) {
            content = 'Aucun utilisateur ne correspond à l\'email indiqué';
          } else {
            content = 'Erreur. Si le problème persiste, contactez le support technique';
          }
        }
        NotifyNegative(content);
        console.error(e.response);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.message
  font-size: 14px
</style>
