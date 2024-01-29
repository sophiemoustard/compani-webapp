<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Raison sociale" v-model="company.name" @focus="saveTmp('name')"
          @blur="trimAndUpdateCompany('name')" :error="v$.company.name.$error" />
        <ni-input caption="Nom commercial" v-model="company.tradeName" @focus="saveTmp('tradeName')"
          @blur="trimAndUpdateCompany('tradeName')" :error="v$.company.tradeName.$error"
          :error-message="tradeNameError(v$.company)" />
        <ni-search-address v-model="company.address" :error-message="addressError" @blur="updateCompany('address')"
            @focus="saveTmp('address.fullAddress')" :error="v$.company.address.$error" />
        <ni-select v-model="company.type" caption="Type" :options="companyTypeOptions" @focus="saveTmp('type')"
          @blur="trimAndUpdateCompany('type')" />
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
import useVuelidate from '@vuelidate/core';
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Companies from '@api/Companies';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import CoachList from '@components/table/CoachList';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { validTradeName, frAddress } from '@helpers/vuelidateCustomVal';
import { COMPANY_TYPES } from '@data/constants';
import { useValidations } from '@composables/validations';
import { useCompanies } from '@composables/companies';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-coach-list': CoachList,
    'ni-search-address': SearchAddress,
    'ni-select': Select,
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const tmpInput = ref('');
    const companyTypeOptions = COMPANY_TYPES;

    const $store = useStore();
    const company = computed(() => $store.state.company.company);

    const companyRules = computed(() => ({
      company: {
        name: { required },
        type: { required },
        tradeName: { validTradeName },
        address: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { required, frAddress },
          location: { required },
        },
      },
    }));

    const v$ = useVuelidate(companyRules, { company });
    const { waitForValidation } = useValidations();
    const { tradeNameError, addressError } = useCompanies(v$.value);

    const saveTmp = (path) => { tmpInput.value = get(company.value, path); };

    const refreshCompany = async () => {
      try {
        await $store.dispatch('company/fetchCompany', { companyId: profileId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const trimAndUpdateCompany = async (path) => {
      const value = get(company.value, path);
      set(company.value, path, value ? value.trim() : '');

      await updateCompany(path);
    };

    const updateCompany = async (path) => {
      try {
        const value = get(company.value, path);
        if (path === 'address' && tmpInput.value === get(company.value, 'address.fullAddress')) return;
        if (tmpInput.value === value) return;
        v$.value.company.$touch();

        if (get(v$.value.company, path)) {
          const isValid = await waitForValidation(v$.value.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const payload = set({}, path, value);
        await Companies.updateById(company.value._id, payload);
        NotifyPositive('Modification enregistrée.');

        await refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        tmpInput.value = '';
      }
    };

    const created = async () => {
      if (!company.value) await refreshCompany();
    };

    created();

    return {
      // Data
      tmpInput,
      companyTypeOptions,
      // Validations
      v$,
      // Methods
      saveTmp,
      trimAndUpdateCompany,
      updateCompany,
      tradeNameError,
      // Computed
      company,
      addressError,
    };
  },
};
</script>
