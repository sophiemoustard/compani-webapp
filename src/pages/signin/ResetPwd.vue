<template>
  <div>
    <compani-header />
    <div class="row justify-center layout-padding neutral-background page-container">
      <div class="col-md-6 col-xs-12">
        <p class="q-mb-lg message">Veuillez renseigner un nouveau mot de passe.</p>
        <ni-input caption="Nouveau mot de passe (6 caractères minimum)" :error="$v.password.$error"
          v-model.trim="password" @blur="$v.password.$touch" type="password"
          error-label="Le mot de passe doit contenir entre 6 et 20 caractères." required-field />
        <ni-input caption="Confirmation nouveau mot de passe" :error="$v.passwordConfirm.$error"
          v-model.trim="passwordConfirm" @blur="$v.passwordConfirm.$touch" type="password" required-field
          error-label="Le mot de passe entré et la confirmation sont différents." />
        <div class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="$v.$invalid">Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sameAs, minLength, maxLength, required } from 'vuelidate/lib/validators'

import CompaniHeader from '../../components/CompaniHeader';
import Input from '../../components/form/Input';
import users from '../../api/Users'
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify';

export default {
  components: {
    'compani-header': CompaniHeader,
    'ni-input': Input,
  },
  data () {
    return {
      password: '',
      passwordConfirm: '',
      token: null,
      userId: null,
      userEmail: '',
      timeout: null,
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      if (to.params.token) {
        const checkToken = await users.checkResetPasswordToken(to.params.token);
        next(vm => vm.setData(checkToken));
      } else {
        next({ path: '/403-pwd' });
      }
    } catch (e) {
      if (e.response) {
        console.error(e.response);
      } else {
        console.error(e);
      }
      next({ path: '/error403Pwd' });
    }
  },
  validations: {
    password: {
      required,
      minLength: minLength(6),
      maxLength: maxLength(20),
    },
    passwordConfirm: {
      required,
      sameAsPassword: sameAs('password'),
    },
  },
  methods: {
    setData (checkToken) {
      this.token = checkToken.token;
      this.userId = checkToken.user._id;
      this.userEmail = checkToken.user.email;
      this.from = checkToken.user.from;
    },
    async submit () {
      try {
        const userPayload = {
          _id: this.userId,
          local: { password: this.password },
          resetPassword: {
            token: null,
            expiresIn: null,
            from: null,
          },
        };
        await this.$users.updateById(userPayload, this.token);
        let detail = '';
        let action = null;
        switch (this.from) {
          case 'p':
            detail = 'Mot de passe changé. Redirection vers Pigi...';
            action = () => {
              window.location.href = `${process.env.MESSENGER_LINK}`;
            };
            break;
          default:
            detail = 'Mot de passe changé. Redirection vers la page de connexion...';
            action = () => {
              this.$router.replace({ path: '/login' });
            };
        }
        NotifyPositive(detail);
        this.timeout = setTimeout(action, 2000)
      } catch (e) {
        NotifyNegative('Erreur, si le problème persiste, contactez le support technique');
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
