<template>
  <div>
    <div class="q-mt-lg q-mb-xl">
      <div v-if="courseBills.length">
        <div v-for="bill of courseBills" :key="bill._id">
          <p class="text-weight-bold">Infos de facturation</p>
          <q-card flat class="q-mb-sm">
            <q-card-section class="cursor-pointer row" :id="bill._id">
              <q-item-section>
                <div class="text-weight-bold">A facturer - {{ formatPrice(bill.netInclTaxes) }}</div>
                <div>Payeur : {{ get(bill, 'courseFundingOrganisation.name') || get(bill, 'company.name') }}</div>
              </q-item-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else class="row justify-end">
        <ni-button label="Démarrer la facturation" color="white" class="bg-primary" icon="payment"
          @click="openBillCreationModal" :disable="billsLoading" />
      </div>
    </div>

    <ni-bill-creation-modal v-model="billCreationModal" v-model:new-bill="newBill"
      @submit="addBill" :validations="validations.newBill" @hide="resetBillCreationForm"
      :loading="billsLoading" :payer-options="payerList" :price-error="priceError" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import { formatAndSortOptions, formatPrice } from '@helpers/utils';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import { REQUIRED_LABEL } from '@data/constants';
import BillCreationModal from 'src/modules/vendor/components/billing/CourseBillCreationModal';

export default {
  name: 'BillingConfig',
  components: {
    'ni-bill-creation-modal': BillCreationModal,
    'ni-button': Button,
  },
  setup () {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);
    const $store = useStore();

    const billsLoading = ref(false);
    const payerList = ref([]);
    const courseBills = ref([]);
    const billCreationModal = ref(false);
    const newBill = ref({ funder: '', price: '' });

    const rules = {
      newBill: {
        funder: {},
        price: { required, strictPositiveNumber },
      },
    };
    const validations = useVuelidate(rules, { newBill });

    const course = computed(() => $store.state.course.course);

    const priceError = computed(() => {
      if (get(validations, 'value.newBill.price.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'value.newBill.price.strictPositiveNumber.$response') === false) {
        return 'Prix non valide';
      }

      return '';
    });

    const refreshCourseFundingOrganisations = async () => {
      try {
        const organisations = await CourseFundingOrganisations.list();
        payerList.value = formatAndSortOptions(
          [...organisations, { _id: '', name: course.value.company.name }],
          'name'
        );
      } catch (e) {
        console.error(e);
        payerList.value = [];
        NotifyNegative('Erreur lors de la récupération des financeurs.');
      }
    };

    const refreshCourseBills = async () => {
      try {
        courseBills.value = await CourseBills.list({ course: course.value._id });
      } catch (e) {
        console.error(e);
        courseBills.value = [];
        NotifyNegative('Erreur lors de la récupération des factures.');
      }
    };

    const openBillCreationModal = () => { billCreationModal.value = true; };

    const resetBillCreationForm = () => {
      newBill.value = { funder: '', price: '' };
      validations.value.newBill.$reset();
    };

    const addBill = async () => {
      try {
        validations.value.newBill.$touch();
        if (validations.value.newBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        billsLoading.value = true;
        await CourseBills.create({
          course: course.value._id,
          mainFee: { price: newBill.value.price },
          company: course.value.company._id,
          ...(!!newBill.value.funder && { courseFundingOrganisation: newBill.value.funder }),
        });
        NotifyPositive('Facture créée.');

        billCreationModal.value = false;
        await refreshCourseBills();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la facture.');
      } finally {
        billsLoading.value = false;
      }
    };

    const created = async () => {
      refreshCourseFundingOrganisations();
      refreshCourseBills();
    };

    created();

    return {
      // Data
      billsLoading,
      billCreationModal,
      newBill,
      payerList,
      courseBills,
      // Computed
      validations,
      course,
      priceError,
      // Methods
      refreshCourseFundingOrganisations,
      resetBillCreationForm,
      addBill,
      openBillCreationModal,
      refreshCourseBills,
      get,
      formatPrice,
    };
  },
};
</script>
