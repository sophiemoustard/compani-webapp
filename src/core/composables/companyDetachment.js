import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import { formatIdentity } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import UserCompanies from '@api/UserCompanies';
import { DAY } from '@data/constants';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

const DETACHMENT_ALLOWED_COMPANY_IDS = process.env.DETACHMENT_ALLOWED_COMPANY_IDS.split(',');

export const useCompanyDetachment = (userProfile, refresh) => {
  const companyDetachModal = ref(false);
  const detachmentDate = ref(CompaniDate().endOf(DAY).toISO());
  const detachModalLoading = ref(false);
  const userIdentity = ref('');

  const $q = useQuasar();

  const company = computed(() => get(userProfile.value, 'company'));

  const minDetachmentDate = computed(() => (get(company.value, 'startDate') || ''));

  const canDetachFromCompany = computed(() => {
    const doesCompanyAllowingDetachment =
      DETACHMENT_ALLOWED_COMPANY_IDS.includes(get(userProfile.value, 'company._id'));
    const userGetRole = get(userProfile.value, 'role.client._id') || get(userProfile.value, 'role.vendor._id') || '';

    return doesCompanyAllowingDetachment && !get(company.value, 'endDate') && !userGetRole;
  });

  watch(userProfile, () => { userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL'); });

  const openCompanyDetachModal = () => (companyDetachModal.value = true);

  const validateCompanyDetachement = () => {
    $q.dialog({
      title: 'Confirmation',
      message: `Êtes-vous sûr(e) de vouloir détacher <b>${userIdentity.value}</b> de la structure
        <b>${get(company.value, 'name')}</b>&nbsp;?
        <br /> <br />La structure n’aura plus accès aux informations de cette personne et ne pourra plus l’inscrire en
        formation.`,
      html: true,
      ok: true,
      cancel: 'Annuler',
    }).onOk(() => detachCompany())
      .onCancel(() => NotifyPositive('Détachement annulé.'));
  };

  const detachCompany = async () => {
    try {
      await UserCompanies.update(get(company.value, '_id'), { endDate: CompaniDate(detachmentDate.value).toISO() });

      companyDetachModal.value = false;
      NotifyPositive('Modification enregistrée.');

      await refresh();
    } catch (e) {
      console.error(e);
      if (e.status === 403 && e.data.message) return NotifyNegative(e.data.message);
      NotifyNegative('Erreur lors de la modification.');
    }
  };

  const resetDetachmentModal = () => (detachmentDate.value = CompaniDate().endOf(DAY).toISO());

  return {
    // Data
    companyDetachModal,
    detachmentDate,
    detachModalLoading,
    userIdentity,
    // Computed
    canDetachFromCompany,
    company,
    minDetachmentDate,
    // Methods
    openCompanyDetachModal,
    validateCompanyDetachement,
    resetDetachmentModal,
  };
};
