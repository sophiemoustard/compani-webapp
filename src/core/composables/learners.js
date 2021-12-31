import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, email, requiredIf } from '@vuelidate/validators';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';
import Users from '@api/Users';
import Email from '@api/Email';
import { TRAINEE } from '@data/constants';
import { dateDiff } from '@helpers/date';
import { clear, formatIdentity, removeDiacritics, removeEmptyProps, formatPhoneForPayload } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useLearners = (company, isClientInterface, refresh) => {
  const newLearner = ref({
    identity: { firstname: '', lastname: '' },
    contact: { phone: '' },
    local: { email: '' },
    company: '',
  });
  const searchStr = ref('');
  const learnerCreationModalLoading = ref(false);
  const learnerCreationModal = ref(false);
  const firstStep = ref(true);
  const learnerList = ref([]);
  const tableLoading = ref(false);
  const userAlreadyHasCompany = ref(false);
  const learnerAlreadyExists = ref(false);

  const filteredLearners = computed(() => {
    const formattedString = escapeRegExp(removeDiacritics(searchStr.value));

    return learnerList.value.filter(user => user.learner.noDiacriticsName.match(new RegExp(formattedString, 'i')));
  });

  const rules = computed(() => ({
    newLearner: {
      identity: { lastname: { required } },
      local: { email: { required, email } },
      contact: { phone: { required, frPhoneNumber } },
      company: { required: requiredIf(!isClientInterface) },
    },
  }));

  const learnerValidation = useVuelidate(rules, { newLearner });

  const goToNextStep = () => {
    firstStep.value = false;
    learnerValidation.value.newLearner.$reset();
  };

  const getDaysSinceLastActivityHistory = (lastActivityHistory) => {
    if (!lastActivityHistory) return null;

    return dateDiff(Date.now(), lastActivityHistory.updatedAt);
  };

  const formatRow = (user) => {
    const formattedName = formatIdentity(user.identity, 'FL');

    return {
      learner: {
        _id: user._id,
        fullName: formattedName,
        lastname: user.identity.lastname,
        picture: user.picture ? user.picture.link : null,
        noDiacriticsName: removeDiacritics(formattedName),
      },
      company: user.company ? user.company.name : 'N/A',
      blendedCoursesCount: user.blendedCoursesCount,
      eLearningCoursesCount: user.eLearningCoursesCount,
      activityHistoryCount: user.activityHistoryCount,
      daysSinceLastActivityHistory: getDaysSinceLastActivityHistory(user.lastActivityHistory),
    };
  };

  const getLearnerList = async (companyId = null) => {
    try {
      tableLoading.value = true;
      const learners = await Users.learnerList(companyId ? { company: companyId } : {});
      learnerList.value = Object.freeze(learners.map(formatRow));
    } catch (e) {
      console.error(e);
      learnerList.value = [];
    } finally {
      tableLoading.value = false;
    }
  };

  const formatUserPayload = () => {
    const payload = removeEmptyProps(newLearner.value);
    if (get(payload, 'contact.phone')) payload.contact.phone = formatPhoneForPayload(newLearner.value.contact.phone);

    return isClientInterface ? { ...payload, company: company._id } : payload;
  };

  const sendWelcome = async () => {
    try {
      await Email.sendWelcome({ email: newLearner.value.local.email, type: TRAINEE });
      NotifyPositive('Email envoyé');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'envoi du mail.');
    }
  };

  const createLearner = async () => {
    try {
      const payload = formatUserPayload();
      const user = await Users.create(payload);
      NotifyPositive('Apprenant(e) ajouté(e) avec succès.');

      await sendWelcome();
      return user._id;
    } catch (e) {
      console.error(e);
      if (e.status === 409) NotifyNegative(e.data.message);
      throw e;
    }
  };

  const updateLearner = async () => {
    const payload = formatUserPayload();

    await Users.updateById(newLearner.value._id, payload);
    NotifyPositive('Apprenant(e) modifié(e).');

    return newLearner.value._id;
  };

  const submitLearnerCreationModal = async () => {
    learnerValidation.value.newLearner.$touch();
    if (learnerValidation.value.newLearner.$error) return NotifyWarning('Champ(s) invalide(s).');

    try {
      learnerCreationModalLoading.value = true;
      if (learnerAlreadyExists.value) await updateLearner();
      else await createLearner();

      await refresh();
      learnerCreationModal.value = false;
    } catch (e) {
      NotifyNegative('Erreur lors de l\'ajout de l\' apprenant(e).');
    } finally {
      learnerCreationModalLoading.value = false;
    }
  };

  const resetLearnerCreationModal = () => {
    firstStep.value = true;
    newLearner.value = { ...clear(newLearner.value) };
    learnerValidation.value.newLearner.$reset();
    userAlreadyHasCompany.value = false;
    learnerAlreadyExists.value = false;
  };

  const updateSearch = (value) => {
    this.searchStr = value;
  };

  return {
    // Data
    searchStr,
    learnerCreationModal,
    newLearner,
    learnerCreationModalLoading,
    firstStep,
    learnerList,
    tableLoading,
    userAlreadyHasCompany,
    learnerAlreadyExists,
    // Computed
    filteredLearners,
    // Validations
    learnerValidation,
    // Methods
    updateSearch,
    goToNextStep,
    getLearnerList,
    submitLearnerCreationModal,
    resetLearnerCreationModal,
  };
};
