import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import { extend } from '@helpers/utils';
import Companies from '@api/Companies';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';

export const configMixin = {
  data () {
    const companyModel = {
      address: { fullAddress: '' },
      billingRepresentative: {},
    };

    return {
      tmpInput: '',
      resetCompany: companyModel,
      company: companyModel,
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ loggedCompany: 'main/getCompany' }),
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path);
    },
    async refreshCompany () {
      await this.$store.dispatch('main/fetchLoggedUser', this.loggedUser._id);
      this.company = { ...extend(this.resetCompany, this.loggedCompany) };
      this.v$.company.$touch();
    },
    async updateCompany (path) {
      try {
        if (path === 'address' && this.tmpInput === get(this.company, 'address.fullAddress')) return;
        if (this.tmpInput === get(this.company, path)) return;

        if (get(this.v$.company, path)) {
          const isValid = await this.waitForValidation(this.v$.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        let payload;
        if (path === 'billingRepresentative') {
          this.billingRepresentativeModalLoading = true;
          this.v$.tmpBillingRepresentative.$touch();
          if (this.v$.tmpBillingRepresentative.$error) return NotifyWarning('Champ(s) invalide(s)');

          payload = { billingRepresentative: this.tmpBillingRepresentative._id };
        } else {
          payload = set({}, path, get(this.company, path));
        }
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
        this.billingRepresentativeModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
        this.tmpBillingRepresentative = {};
        this.billingRepresentativeModalLoading = false;
      }
    },
  },
};
