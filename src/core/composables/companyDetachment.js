import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
// import { minDate } from '@helpers/vuelidateCustomVal';
import { formatIdentity } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import UserCompanies from '@api/UserCompanies';
import { DAY } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

export const useCompanyDetachment = (userProfile, refresh) => {
  const companyDetachModal = ref(false);
  const detachmentDate = ref(CompaniDate().endOf(DAY).toISO());
  const detachModalLoading = ref(false);
  const userIdentity = ref('');

  const $q = useQuasar();

  const userCompany = computed(() => (get(userProfile.value, 'userCompanyList') || []).find(uc => !uc.endDate));

  const minDetachmentDate = computed(() => (get(userCompany.value, 'startDate') || ''));

  const companyName = computed(() => get(userProfile.value, 'company.name'));

  const canDetachFromCompany = computed(() => {
    const isFromEps = process.env.COMPANIES_ID_DETACHMENT_IS_ALLOWED.includes(get(userProfile.value, 'company._id'));
    return isFromEps && !!userCompany.value;
  });

  watch(userProfile, () => { userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL'); });

  const openCompanyDetachModal = () => (companyDetachModal.value = true);

  const rules = {
    // detachmentDate: { required, minDate: minDate(minDetachmentDate.value) },
    detachmentDate: { required },
  };
  const v$ = useVuelidate(rules, { detachmentDate });

  const validateCompanyDetachement = () => {
    $q.dialog({
      title: 'Confirmation',
      message: `Êtes-vous sûr(e) de vouloir détacher <b>${userIdentity.value}</b> de la structure
        <b>${companyName.value}</b>&nbsp;?
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
      v$.value.detachmentDate.$touch();
      if (v$.value.detachmentDate.$error) return NotifyWarning('Date invalide.');

      await UserCompanies.update(
        get(userCompany.value, '_id'),
        { endDate: CompaniDate(detachmentDate.value).toISO() }
      );

      companyDetachModal.value = false;
      NotifyPositive('Modification enregistrée.');

      await refresh();
    } catch (e) {
      console.error(e);
      if (e.status === 403 && e.data.message) return NotifyNegative(e.data.message);
      NotifyNegative('Erreur lors de la modification.');
    }
  };

  const resetDetachmentModal = () => {
    detachmentDate.value = CompaniDate().endOf(DAY).toISO();
    v$.value.detachmentDate.$reset();
  };

  return {
    // Data
    companyDetachModal,
    detachmentDate,
    detachModalLoading,
    userIdentity,
    // Validations
    detachmentValidations: v$,
    // Computed
    companyName,
    canDetachFromCompany,
    userCompany,
    minDetachmentDate,
    // Methods
    openCompanyDetachModal,
    validateCompanyDetachement,
    resetDetachmentModal,
  };
};
