import { minLength } from 'vuelidate/lib/validators'
import { REQUIRED_LABEL } from '@data/constants'
import { validPassword } from '@helpers/vuelidateCustomVal.js'

export const passwordMixin = {
  data () {
    return {
      passwordValidation: {
        validPassword,
        minLength: minLength(8),
      },
    }
  },
  computed: {
    passwordConfirmError () {
      if (!this.$v.passwordConfirm.required) return REQUIRED_LABEL;
      else if (!this.$v.passwordConfirm.sameAs) return 'Le mot de passe doit être identique.';
      return 'Mot de passe invalide.';
    },
  },
  methods: {
    passwordError (validationObj) {
      if (validationObj.required === false) return REQUIRED_LABEL;
      if (!validationObj.minLength) {
        return 'Le mot de passe doit contenir au minimum 8 caractères.';
      }
      if (!validationObj.validPassword) {
        return 'Le mot de passe doit contenir au moins un chiffre, une majuscule, une minuscule et un caractère spécial(ex: !@#$%^&).'
      }
      return ''
    },
  },
}
