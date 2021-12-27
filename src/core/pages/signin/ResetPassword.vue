<template>
  <div>
    <compani-header />
    <div class="row justify-center q-layout-padding client-background page-container">
      <div class="col-md-6 col-xs-12">
        <p class="q-mb-lg message">Veuillez renseigner un nouveau mot de passe.</p>
        <ni-input caption="Nouveau mot de passe (6 caractères minimum)" :error="$v.password.$error"
          v-model.trim="password" @blur="$v.password.$touch" type="password"
          :error-message="passwordError($v.password)" required-field />
        <ni-input caption="Confirmation nouveau mot de passe" :error="$v.passwordConfirm.$error"
          v-model.trim="passwordConfirm" @blur="$v.passwordConfirm.$touch" type="password" required-field
          :error-message="passwordConfirmError($v.passwordConfirm)" />
        <div class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="$v.$invalid">Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sameAs, required, requiredIf } from 'vuelidate/lib/validators';
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import Authentication from '@api/Authentication';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { isUserLogged } from '@helpers/alenvi';
import { passwordMixin } from '@mixins/passwordMixin';
import { logInMixin } from '@mixins/logInMixin';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  mixins: [passwordMixin, logInMixin],
  data () {
    return {
      password: '',
      passwordConfirm: '',
      userId: null,
      timeout: null,
      userEmail: '',
    };
  },
  async beforeRouteEnter (to, from, next) {
    try {
      const isLogged = await isUserLogged();
      if (isLogged) return next({ path: '/' });

      if (to.params.token) {
        const checkToken = await Authentication.checkPasswordToken(to.params.token);
        next(vm => vm.setData(checkToken));
      } else {
        logOutAndRedirectToLogin();
      }
    } catch (e) {
      if (e.response) console.error(e.response);
      else console.error(e);
      logOutAndRedirectToLogin();
    }
  },
  validations () {
    return {
      password: { required, ...this.passwordValidation },
      passwordConfirm: {
        required: requiredIf(item => item.password),
        sameAsPassword: sameAs('password'),
      },
    };
  },
  methods: {
    setData (checkToken) {
      this.userId = checkToken.user._id;
      this.userEmail = checkToken.user.email;
    },
    async logIn () {
      try {
        await this.logInUser({ email: this.userEmail, password: this.password });
      } catch (e) {
        NotifyNegative('Erreur lors de la connexion. Si le problème persiste, contactez le support technique.');
        console.error(e);
      }
    },
    async submit () {
      try {
        await Authentication.updatePassword(this.userId, { local: { password: this.password }, isConfirmed: true });

        NotifyPositive('Mot de passe changé. Connexion en cours...');
        this.timeout = setTimeout(() => this.logIn(), 2000);
      } catch (e) {
        NotifyNegative('Erreur, si le problème persiste, contactez le support technique.');
        console.error(e.response);
      }
    },
  },
  beforeUnmount () {
    clearTimeout(this.timeout);
  },
};
</script>

<style lang="sass" scoped>
  .message
    font-size: 14px
</style>
