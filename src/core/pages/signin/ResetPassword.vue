<template>
  <div>
    <compani-header />
    <div class="row justify-center q-layout-padding neutral-background page-container">
      <div class="col-md-6 col-xs-12">
        <p class="q-mb-lg message">Veuillez renseigner un nouveau mot de passe.</p>
        <ni-input caption="Nouveau mot de passe (6 caractères minimum)" :error="$v.password.$error"
          v-model.trim="password" @blur="$v.password.$touch" type="password"
          :error-label="passwordError($v.password)" required-field />
        <ni-input caption="Confirmation nouveau mot de passe" :error="$v.passwordConfirm.$error"
          v-model.trim="passwordConfirm" @blur="$v.passwordConfirm.$touch" type="password" required-field
          :error-label="passwordConfirmError" />
        <div class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="$v.$invalid">Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sameAs, required, requiredIf } from 'vuelidate/lib/validators'
import CompaniHeader from '@components/CompaniHeader';
import Input from '@components/form/Input';
import Users from '@api/Users'
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { passwordMixin } from '@mixins/passwordMixin';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  mixins: [passwordMixin],
  data () {
    return {
      password: '',
      passwordConfirm: '',
      token: null,
      userId: null,
      timeout: null,
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      if (to.params.token) {
        const checkToken = await Users.checkResetPasswordToken(to.params.token);
        next(vm => vm.setData(checkToken));
      } else {
        next({ path: '/login' });
      }
    } catch (e) {
      if (e.response) console.error(e.response);
      else console.error(e);
      next({ path: '/login' });
    }
  },
  validations () {
    return {
      password: { required, ...this.passwordValidation },
      passwordConfirm: {
        required: requiredIf(item => item.password),
        sameAsPassword: sameAs('password'),
      },
    }
  },
  methods: {
    setData (checkToken) {
      this.token = checkToken.token;
      this.userId = checkToken.user._id;
    },
    async submit () {
      try {
        await Users.updatePassword(this.userId, { local: { password: this.password }, isConfirmed: true }, this.token);

        NotifyPositive('Mot de passe changé. Redirection vers la page de connexion...');
        this.timeout = setTimeout(() => this.$router.replace({ path: '/login' }), 2000)
      } catch (e) {
        NotifyNegative('Erreur, si le problème persiste, contactez le support technique.');
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
