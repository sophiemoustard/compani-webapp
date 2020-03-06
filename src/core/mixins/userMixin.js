import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { frAddress, frPhoneNumber } from '@helpers/vuelidateCustomVal';

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
}
