<template>
  <div>
    <compani-header />
    <div class="neutral-background" style="min-height: 100vh">
      <q-card flat style="width: 500px; max-width: 90vw; margin: auto">
        <q-card-main>
          <p class="q-mb-lg">Nous allons vous envoyer un email pour réinitialiser votre mot de passe. Veuillez renseigner votre adresse
          email :</p>
          <p class="input-caption">Email</p>
          <q-field :error="$v.email.$error" error-label="Veuillez rentrer un email valide. (ex: mail@mail.com)">
            <q-input v-model.trim="email" @blur="$v.email.$touch" inverted-light color="white" />
          </q-field>
        </q-card-main>
        <q-card-actions class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="$v.email.$invalid">Envoyer</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators'

import CompaniHeader from '../../components/CompaniHeader';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify';

export default {
  components: {
    CompaniHeader,
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
</style>
