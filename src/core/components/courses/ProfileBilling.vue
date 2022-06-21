<template>
  <div>
    <div v-for="company of companies" :key="company._id">
      <ni-course-billing-card :company="company" :course="course"
      :payer-list="payerList" :billing-item-list="billingItemList" />
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import get from 'lodash/get';
import omit from 'lodash/omit';
import uniqBy from 'lodash/uniqBy';
import pickBy from 'lodash/pickBy';
import { formatAndSortOptions, formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import Companies from '@api/Companies';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import CourseBillingItems from '@api/CourseBillingItems';
import { NotifyNegative } from '@components/popup/notify';
import { LIST, COMPANY } from '@data/constants';
import CourseBillingCard from 'src/modules/vendor/components/billing/CourseBillingCard';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-course-billing-card': CourseBillingCard,
  },
  setup () {
    const $store = useStore();
    const courseBills = ref([]);
    const billsLoading = ref(false);
    const payerList = ref([]);
    const billingItemList = ref([]);
    const FUNDING_ORGANISATION = 'funding_organisation';

    const course = computed(() => $store.state.course.course);

    const companies = computed(() => {
      const traineesCompanies = course.value.trainees.map(trainee => trainee.company);
      const billsCompanies = courseBills.value.map(bill => bill.company);

      return uniqBy([...traineesCompanies, ...billsCompanies], '_id');
    });

    const getCompanyBills = async company => courseBills.value.filter(bill => bill.company._id === company._id);

    const refreshCourseBills = async () => {
      try {
        billsLoading.value = true;
        courseBills.value = await CourseBills.list({ course: course.value._id, action: LIST });
      } catch (e) {
        console.error(e);
        courseBills.value = [];
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        billsLoading.value = false;
      }
    };

    const refreshPayers = async () => {
      try {
        const organisations = await CourseFundingOrganisations.list();
        const companyList = await Companies.list();
        const formattedOrganisationList = formatAndSortOptions(organisations, 'name');
        const formattedCompanyList = formatAndSortOptions(companyList, 'name');
        payerList.value =
          [
            ...formattedOrganisationList.map(payer => ({ ...payer, type: FUNDING_ORGANISATION })),
            ...formattedCompanyList.map(company => ({ ...company, type: COMPANY })),
          ];
      } catch (e) {
        console.error(e);
        payerList.value = [];
        NotifyNegative('Erreur lors de la récupération des financeurs.');
      }
    };

    const refreshBillingItems = async () => {
      try {
        billsLoading.value = true;
        const billingItems = await CourseBillingItems.list();
        billingItemList.value = formatAndSortOptions([...billingItems], 'name');
      } catch (e) {
        console.error(e);
        billingItemList.value = [];
        NotifyNegative('Erreur lors de la récupération des articles de facturation.');
      } finally {
        billsLoading.value = false;
      }
    };

    const created = async () => {
      await refreshCourseBills();
      await refreshPayers();
      await refreshBillingItems();
    };

    created();

    return {
      // Data
      payerList,
      billingItemList,
      courseBills,
      // Computed
      course,
      companies,
      // Methods
      refreshCourseBills,
      getCompanyBills,
      refreshPayers,
      refreshBillingItems,
      get,
      omit,
      pickBy,
      formatPrice,
      formatDate,
    };
  },
};
</script>
