import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import { NotifyWarning } from '@components/popup/notify';

export const useCompaniesLink = (companies, course) => {
  const selectedCompany = ref('');
  const companyAdditionModal = ref(false);
  const companyModalLoading = ref(false);
  const companyOptions = ref([]);

  const companiesCount = computed(() => companies.value.length);

  const rules = { selectedCompany: { required } };

  const companyValidation = useVuelidate(rules, { selectedCompany });

  const resetCompanyAdditionModal = () => {
    selectedCompany.value = '';
    companyValidation.value.selectedCompany.$reset();
  };

  const getPotentialCompanies = async () => {
    try {
      const potentialCompanies = Object.freeze(await Companies.list());
      companyOptions.value = potentialCompanies
        .map(company => ({ value: company._id, label: company.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      companyOptions.value = [];
      console.error(error);
    }
  };

  const openCompanyAdditionModal = () => {
    if (course.value.archivedAt) {
      return NotifyWarning('Vous ne pouvez pas ajouter de structure à une formation archivée.');
    }

    companyAdditionModal.value = true;
  };

  return {
    // Data
    selectedCompany,
    companyAdditionModal,
    companyModalLoading,
    companyOptions,
    // Computed
    companiesCount,
    // Validations
    companyValidation,
    // Methods
    resetCompanyAdditionModal,
    getPotentialCompanies,
    openCompanyAdditionModal,
  };
};
