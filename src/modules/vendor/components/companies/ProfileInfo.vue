<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Raison sociale" v-model.trim="company.name" @focus="saveTmp('name')"
          @blur="updateCompany('name')" :error="v$.company.name.$error" />
        <ni-input caption="Nom commercial" v-model.trim="company.tradeName" @focus="saveTmp('tradeName')"
          @blur="updateCompany('tradeName')" :error="v$.company.tradeName.$error"
          :error-message="tradeNameError(v$.company)" />
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
import Input from '@components/form/Input';
import CoachList from '@components/table/CoachList';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { validTradeName } from '@helpers/vuelidateCustomVal';
import { companyMixin } from '@mixins/companyMixin';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  setup () { return { v$: useVuelidate() }; },
  components: {
    'ni-input': Input,
    'ni-coach-list': CoachList,
  },
  mixins: [companyMixin],
  validations () {
    return { company: { name: { required }, tradeName: { validTradeName } } };
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
        if (this.tmpInput === value) return;
        this.v$.company.$touch();
        if (this.v$.company.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
  },
};
</script>
