<template>
  <div>
    <compani-header />
    <div class="row justify-center layout-padding neutral-background" style="min-height: 100vh">
      <div class="col-md-6 col-xs-12">
        <div class="margin-input">
          <div class="q-mb-lg message">Nous allons vous envoyer un email pour réinitialiser votre mot de passe.
            Veuillez renseigner votre adresse email.</div>
          <ni-input caption="Email" :error="$v.email.$error" v-model.trim="email" @blur="$v.email.$touch"
            error-label="Veuillez rentrer un email valide. (ex: mail@mail.com)" required-field />
        </div>
        <div class="row justify-center">
          <q-btn class="btn-submit" @click="submit" color="primary" :disable="$v.email.$invalid" big>Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators'

import CompaniHeader from '../../components/CompaniHeader';
import Input from '../../components/form/Input';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      email: '',
    }
  },
  validations: {
    email: { email, required },
  },
  methods: {
    async submit () {
      try {
        const payload = { email: this.email.toLowerCase(), from: this.$route.query.from || 'w' };
        await this.$users.forgotPassword(payload);
        NotifyPositive('Un email a été envoyé à l\'adresse indiquée');
      } catch (e) {
        let content = '';
        if (e.response && e.response.status) {
          if (e.response.status === 400) {
            content = 'Veuillez remplir le champ email.';
          } else if (e.response.status === 404) {
            content = "Aucun utilisateur ne correspond à l'email indiqué";
          } else {
            content = 'Erreur. Si le problème persiste, contactez le support technique';
          }
        }
        NotifyNegative(content);
        console.error(e.response);
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
}
</script>

<style lang="stylus" scoped>
.message
  font-size: 14px
</style>
