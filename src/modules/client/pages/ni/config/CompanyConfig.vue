<template>
  <q-page class="client-background" padding>
    <div v-if="company">
      <ni-title-header title="Configuration générale" class="q-mb-xl" />
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Raison sociale" v-model="company.name" @focus="saveTmp('name')"
            @blur="updateCompany('name')" :error="v$.company.name.$error" />
          <ni-search-address v-model="company.address" :error-message="addressError" @blur="updateCompany('address')"
            @focus="saveTmp('address.fullAddress')" :error="v$.company.address.$error" />
        </div>
      </div>
      <div>
        <p class="text-weight-bold">Contacts</p>
        <div class="interlocutor-container q-mb-xl">
          <interlocutor-cell :interlocutor="company.billingRepresentative" can-update
            caption="Chargé de facturation dans ma structure" label="Ajouter un chargé de facturation"
            @open-modal="openBillingRepresentativeModal" />
        </div>
      </div>
    </div>

    <interlocutor-modal v-model="billingRepresentativeModal" v-model:interlocutor="tmpBillingRepresentativeId"
      @submit="updateCompany('billingRepresentative')" :label="billingRepresentativeModalLabel"
      :interlocutors-options="billingRepresentativeOptions" :loading="billingRepresentativeModalLoading"
      :validations="v$.tmpBillingRepresentativeId" @hide="resetBillingRepresentative" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed } from 'vue';
import { mapGetters, useStore } from 'vuex';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Users from '@api/Users';
import TitleHeader from '@components/TitleHeader';
import Input from '@components/form/Input';
import SearchAddress from '@components/form/SearchAddress';
import InterlocutorCell from '@components/courses/InterlocutorCell';
import InterlocutorModal from '@components/courses/InterlocutorModal';
import { EDITION, CLIENT_ADMIN, HOLDING_ADMIN } from '@data/constants';
import { frAddress } from '@helpers/vuelidateCustomVal';
import { formatAndSortUserOptions } from '@helpers/utils';
import { companyMixin } from '@mixins/companyMixin';
import { validationMixin } from '@mixins/validationMixin';
import { configMixin } from 'src/modules/client/mixins/configMixin';

export default {
  name: 'CompanyConfig',
  components: {
    'ni-input': Input,
    'ni-title-header': TitleHeader,
    'ni-search-address': SearchAddress,
    'interlocutor-cell': InterlocutorCell,
    'interlocutor-modal': InterlocutorModal,
  },
  setup () {
    const metaInfo = { title: 'Configuration générale' };
    useMeta(metaInfo);

    const billingRepresentativeOptions = ref([]);
    const billingRepresentativeModal = ref(false);
    const billingRepresentativeModalLoading = ref(false);
    const billingRepresentativeModalLabel = ref({ action: '', interlocutor: '' });
    const tmpBillingRepresentativeId = ref('');

    const v$ = useVuelidate();
    const $store = useStore();
    const company = computed(() => $store.getters['main/getCompany']);

    const openBillingRepresentativeModal = (event) => {
      const { action: eventAction } = event;
      const action = eventAction === EDITION ? 'Modifier le ' : 'Ajouter un ';

      tmpBillingRepresentativeId.value = get(company.value, 'billingRepresentative._id');
      billingRepresentativeModalLabel.value = { action, interlocutor: 'chargé de facturation de ma structure' };
      billingRepresentativeModal.value = true;
    };

    const refreshBillingRepresentativeOptions = async () => {
      const clientAdminUsers = await Users
        .list({ role: [CLIENT_ADMIN, HOLDING_ADMIN], includeHoldingAdmins: true, company: company.value._id });

      billingRepresentativeOptions.value = formatAndSortUserOptions(clientAdminUsers, false);
    };

    const resetBillingRepresentative = () => {
      tmpBillingRepresentativeId.value = '';
      billingRepresentativeModalLabel.value = { action: '', interlocutor: '' };
      v$.value.tmpBillingRepresentativeId.$reset();
    };

    return {
      // Data
      billingRepresentativeOptions,
      billingRepresentativeModal,
      billingRepresentativeModalLabel,
      tmpBillingRepresentativeId,
      billingRepresentativeModalLoading,
      // Computed
      v$,
      // Methods
      openBillingRepresentativeModal,
      refreshBillingRepresentativeOptions,
      resetBillingRepresentative,
    };
  },
  mixins: [configMixin, validationMixin, companyMixin],
  validations () {
    return {
      company: {
        name: { required },
        address: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { required, frAddress },
          location: { required },
        },
      },
      tmpBillingRepresentativeId: { required },
    };
  },
  computed: {
    ...mapGetters({ clientRole: 'main/getClientRole' }),
  },
  async mounted () {
    const promises = [this.refreshCompany(), this.refreshBillingRepresentativeOptions()];

    await Promise.all(promises);
  },
};
</script>
