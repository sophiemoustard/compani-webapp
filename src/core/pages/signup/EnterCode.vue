<template>
  <div>
    <compani-header />
    <div class="row justify-center q-layout-padding neutral-background page-container">
      <div>
        <ni-input v-model="code" type="tel" autofocus caption="Entre le code à 4 chiffres que tu as reçu par SMS" />
        <div class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="!code" big>Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyWarning } from '@components/popup/notify';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      code: '',
    }
  },
  methods: {
    async submit () {
      try {
        const code = await this.$activationCode.check(this.code);

        const userEmail = this.$_.get(code, 'user.local.email', '');
        const userId = this.$_.get(code, 'user._id', '');
        this.$q.cookies.set('signup_token', code.token, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userEmail', userEmail, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userId', userId, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });

        this.$router.replace({ path: '/createPassword' });
      } catch (e) {
        if (e.response.data && e.response.data.statusCode === 422) {
          this.$router.replace({ path: '/' });
          NotifyWarning('L\'utilisateur est deja actif.');
        } else NotifyNegative('Code invalide.');
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
}
</script>
