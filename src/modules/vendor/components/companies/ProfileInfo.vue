<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Raison sociale" v-model.trim="company.name" @focus="saveTmp('name')"
          @blur="updateCompany('name')" :error="v$.company.name.$error" />
        <ni-input caption="Nom commercial" v-model.trim="company.tradeName" @focus="saveTmp('tradeName')"
          @blur="updateCompany('tradeName')" :error="v$.company.tradeName.$error"
          :error-message="tradeNameError(v$.company)" />
        <ni-search-address v-model="company.address" :error-message="addressError" @blur="updateCompany('address')"
            @focus="saveTmp('address.fullAddress')" :error="v$.company.address.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Abonnements</p>
      <q-checkbox dense v-model="company.subscriptions.erp" color="primary" label="ERP"
        @update:model-value="updateCompany('subscriptions.erp')" />
    </div>
    <ni-coach-list :company="company" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Companies from '@api/Companies';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import CoachList from '@components/table/CoachList';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { validTradeName, frAddress } from '@helpers/vuelidateCustomVal';
import { companyMixin } from '@mixins/companyMixin';
import { validationMixin } from '@mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  setup () {
    const tmpInput = '';

    return { tmpInput, v$: useVuelidate() };
  },
  components: {
    'ni-input': Input,
    'ni-coach-list': CoachList,
    'ni-search-address': SearchAddress,
  },
  mixins: [companyMixin, validationMixin],
  validations () {
    return { company: {
      name: { required },
      tradeName: { validTradeName },
      address: {
        zipCode: { required },
        street: { required },
        city: { required },
        fullAddress: { required, frAddress },
        location: { required },
      },
    } };
  },
  computed: {
    ...mapState('company', ['company']),
  },
  async created () {
    if (!this.company) await this.refreshCompany();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path);
    },
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/fetchCompany', { companyId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateCompany (path) {
      try {
        const value = get(this.company, path);
        if (path === 'address' && this.tmpInput === get(this.company, 'address.fullAddress')) return;
        if (this.tmpInput === value) return;
        this.v$.company.$touch();

        if (get(this.v$.company, path)) {
          const isValid = await this.waitForValidation(this.v$.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const payload = set({}, path, value);
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
  },
};
</script>
