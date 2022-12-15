import { computed, ref, watch } from 'vue';
import get from 'lodash/get';
import { formatIdentity } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import { DAY } from '@data/constants';

export const useCompanyDetachment = (userProfile, refresh) => {
  const companyDetachModal = ref(false);
  const detachmentDate = ref(CompaniDate().endOf(DAY).toISO());
  const detachModalLoading = ref(false);
  const userIdentity = ref('');

  const userCompany = computed(() => (get(userProfile.value, 'userCompanyList') || []).find(uc => !uc.endDate));

  const minDetachmentDate = computed(() => (userCompany.value ? userCompany.value.startDate : ''));

  const companyName = computed(() => get(userProfile.value, 'company.name'));

  const canDetachFromCompany = computed(() => {
    const isFromEps = process.env.COMPANIES_ID_DETACHMENT_IS_ALLOWED.includes(get(userProfile.value, 'company._id'));
    return isFromEps && !!userCompany.value;
  });

  watch(userProfile, () => { userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL'); });

  const openCompanyDetachModal = () => (companyDetachModal.value = true);

  return {
    // Data
    companyDetachModal,
    detachmentDate,
    detachModalLoading,
    userIdentity,
    // Computed
    companyName,
    canDetachFromCompany,
    userCompany,
    minDetachmentDate,
    // Methods
    openCompanyDetachModal,
  };
};
