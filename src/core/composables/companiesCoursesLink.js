import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import Courses from '@api/Courses';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useCompaniesCoursesLink = (companies, course, emit) => {
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

  const addCompany = async () => {
    try {
      companyModalLoading.value = true;
      companyValidation.value.selectedCompany.$touch();
      if (companyValidation.value.selectedCompany.$error) return NotifyWarning('Champ(s) invalide(s)');

      await Courses.addCompany(course.value._id, { company: selectedCompany.value });
      companyAdditionModal.value = false;
      emit('refresh');
      NotifyPositive('Structure ajoutée.');
    } catch (e) {
      console.error(e);
      if (e.status === 409) return NotifyNegative(e.data.message);
      if (e.status === 403) return NotifyWarning(e.data.message);
      NotifyNegative('Erreur lors de l\'ajout de la structure.');
    } finally {
      companyModalLoading.value = false;
    }
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
    addCompany,
  };
};
