import get from 'lodash/get';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { frAddress, frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';

export const userMixin = {
  data () {
    return {
      userValidation: {
        identity: {
          lastname: { required },
          firstname: { required },
          title: { required },
        },
        contact: {
          phone: { required, frPhoneNumber },
          address: {
            zipCode: { required: requiredIf(item => !!item.fullAddress) },
            street: { required: requiredIf(item => !!item.fullAddress) },
            city: { required: requiredIf(item => !!item.fullAddress) },
            fullAddress: { frAddress },
          },
        },
        local: {
          email: { required, email },
        },
        sector: { required },
      },
    };
  },
  methods: {
    async updateUser (path) {
      try {
        if (this.tmpInput === get(this.mergedUserProfile, path)) {
          this.emailLock = true;
          return;
        }

        if (get(this.$v.mergedUserProfile, path)) {
          get(this.$v.mergedUserProfile, path).$touch();
          const isValid = await this.waitForValidation(this.$v.mergedUserProfile, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        await this.updateAlenviUser(path);

        this.$store.commit('rh/saveUserProfile', this.mergedUserProfile);
        this.emailLock = true;
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return this.emailErrorHandler(path);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
        this.emailLock = true;
      }
    },
  },
}
