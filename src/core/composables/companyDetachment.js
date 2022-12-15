import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import { formatIdentity } from '@helpers/utils';
import { NotifyPositive } from '@components/popup/notify';
import CompaniDate from '@helpers/dates/companiDates';
import { DAY } from '@data/constants';

export const useCompanyDetachment = (userProfile) => {
  const $q = useQuasar();

  const companyDetachModal = ref(false);
  const detachmentDate = ref(CompaniDate().startOf(DAY).toISO());
  const detachModalLoading = ref(false);
  const userIdentity = ref('');

  const companyName = computed(() => get(userProfile.value, 'company.name'));

  watch(userProfile, () => { userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL'); });

  const validateCompanyDetachement = () => {
    $q.dialog({
      title: 'Confirmation',
      message: `Êtes-vous sûr(e) de vouloir détacher ${userIdentity.value} de la structure ${companyName.value}&nbsp;?
        \nLa structure n’aura plus accès aux informations de cette personne et ne pourra plus l’inscrire en
        formation.`,
      html: true,
      ok: true,
      cancel: 'Annuler',
    }).onOk(() => detachCompany())
      .onCancel(() => NotifyPositive('Détachement annulé.'));
  };

  const detachCompany = async () => {
    companyDetachModal.value = false;
    // await UserCompanies.update(, { endDate: detachmentDate });
  };

  const openCompanyDetachModal = () => {
    companyDetachModal.value = true;
  };

  return {
    // Data
    companyDetachModal,
    detachmentDate,
    detachModalLoading,
    userIdentity,
    // Computed
    companyName,
    // Methods
    validateCompanyDetachement,
    openCompanyDetachModal,
  };
};
