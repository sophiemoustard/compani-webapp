<template>
  <div>
    <div v-for="company of companies" :key="company._id">
      <ni-course-billing-card :company="company" :course="course" :payer-list="payerList"
      :billing-item-list="billingItemList" :course-bills="courseBills.filter(bill => bill.company._id === company._id)"
      @refresh-course-bills="refreshCourseBills" @refresh-and-unroll="refreshAndUnroll" />
    </div>
    <div v-if="!companies.length" class="text-italic">Aucun stagiaire n'est inscrit à la formation</div>
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
import Companies from '@api/Companies';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import CourseBillingItems from '@api/CourseBillingItems';
import { NotifyNegative } from '@components/popup/notify';
import { LIST, COMPANY } from '@data/constants';
import CourseBillingCard from 'src/modules/vendor/components/billing/CourseBillingCard';
import { useCourses } from '@composables/courses';

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

    const { isIntraCourse } = useCourses(course);

    const companies = computed(() => {
      const traineesCompanies = course.value.trainees.map(trainee => trainee.company);
      const billsCompanies = courseBills.value.map(bill => bill.company);
      const intraCourseCompany = isIntraCourse.value ? course.value.companies : [];

      return uniqBy([...traineesCompanies, ...billsCompanies, ...intraCourseCompany], '_id')
        .sort((a, b) => a.name.localeCompare(b.name));
    });

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

    const refreshAndUnroll = async (unrollBill) => {
      await refreshCourseBills();
      unrollBill();
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
      refreshAndUnroll,
      refreshPayers,
      refreshBillingItems,
      get,
      omit,
      pickBy,
      formatPrice,
    };
  },
};
</script>
