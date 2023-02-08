import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import escapeRegExp from 'lodash/escapeRegExp';
import Users from '@api/Users';
import Email from '@api/Email';
import { TRAINEE, DAY, HELPER, AUXILIARY_WITHOUT_COMPANY } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';
import { clear, formatIdentity, removeDiacritics, removeEmptyProps, formatPhoneForPayload } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useLearners = (refresh, isClientInterface, isDirectory, companies = { value: [] }) => {
  const newLearner = ref({
    identity: { firstname: '', lastname: '' },
    contact: { phone: '' },
    local: { email: '' },
    company: '',
    userCompanyStartDate: CompaniDate().startOf(DAY).toISO(),
  });
  const searchStr = ref('');
  const learnerCreationModalLoading = ref(false);
  const learnerCreationModal = ref(false);
  const firstStep = ref(true);
  const learnerList = ref([]);
  const tableLoading = ref(false);
  const userAlreadyHasCompany = ref(false);
  const learnerAlreadyExists = ref(false);
  const traineeAdditionModal = ref(false);
  const newTrainee = ref('');
  const doesLearnerHaveCurrentCompanyAndCandBeLink = ref(false);

  const filteredLearners = computed(() => {
    const formattedString = escapeRegExp(removeDiacritics(searchStr.value));

    return learnerList.value.filter(user => user.learner.noDiacriticsName.match(new RegExp(formattedString, 'i')));
  });

  const learnerRules = computed(() => ({
    newLearner: {
      identity: { lastname: { required } },
      local: { email: { required, email } },
      contact: { phone: { required, frPhoneNumber } },
      company: { required },
      userCompanyStartDate: { required },
    },
  }));
  const traineeRules = { newTrainee: { required } };

  const learnerValidation = useVuelidate(learnerRules, { newLearner });
  const traineeValidation = useVuelidate(traineeRules, { newTrainee });

  const goToNextStep = () => {
    firstStep.value = false;
    learnerValidation.value.newLearner.$reset();
  };

  const getISODurationSinceLastActivityHistory = (lastActivityHistory) => {
    if (!lastActivityHistory) return null;

    return CompaniDate().diff(lastActivityHistory.updatedAt, 'days');
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
      isoDurationSinceLastActivityHistory: getISODurationSinceLastActivityHistory(user.lastActivityHistory),
    };
  };

  const getLearnerList = async (companyId = null) => {
    try {
      tableLoading.value = true;
      const learners = await Users.learnerList(companyId ? { companies: companyId } : {});
      learnerList.value = Object.freeze(learners.map(formatRow));
    } catch (e) {
      console.error(e);
      learnerList.value = [];
    } finally {
      tableLoading.value = false;
    }
  };

  const formatUserPayload = () => {
    if (doesLearnerHaveCurrentCompanyAndCandBeLink.value) {
      return removeEmptyProps(pick(newLearner.value, ['company', 'userCompanyStartDate']));
    }

    const payload = removeEmptyProps(pick(
      newLearner.value,
      ['identity', 'local', 'contact', 'company', 'userCompanyStartDate']
    ));
    if (get(payload, 'contact.phone')) payload.contact.phone = formatPhoneForPayload(newLearner.value.contact.phone);

    return payload;
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

  const setNewLearner = (user, lastUserCompany) => {
    newLearner.value._id = user._id;
    newLearner.value.identity = {
      firstname: get(user, 'identity.firstname'),
      lastname: get(user, 'identity.lastname'),
    };
    newLearner.value.contact = { phone: get(user, 'contact.phone') };

    if (lastUserCompany && lastUserCompany.endDate) {
      newLearner.value.userCompanyStartDate = CompaniDate(lastUserCompany.endDate).startOf(DAY).add('P1D').toISO();
    }

    if (companies.value.length === 1) newLearner.value.company = companies.value[0];
  };

  const nextStepLearnerCreationModal = async () => {
    try {
      learnerValidation.value.newLearner.$touch();
      if (learnerValidation.value.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

      learnerCreationModalLoading.value = true;
      const userInfo = await Users.exists({ email: newLearner.value.local.email });

      if (!userInfo.exists) {
        if (companies.value.length === 1) newLearner.value.company = companies.value[0];

        return goToNextStep();
      }

      if (isDirectory && !isClientInterface) return NotifyWarning('L\'apprenant(e) est déjà ajouté(e).');

      if (!get(userInfo, 'user._id')) {
        return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
      }

      const lastUserCompany = userInfo.user.userCompanyList[0];
      doesLearnerHaveCurrentCompanyAndCandBeLink.value = lastUserCompany && !!lastUserCompany.endDate;
      let user;

      if (doesLearnerHaveCurrentCompanyAndCandBeLink.value) {
        const hasCurrentCompany = lastUserCompany && !lastUserCompany.endDate;
        if (hasCurrentCompany && companies.value.includes(lastUserCompany.company)) {
          return isDirectory
            ? NotifyWarning('Un compte rattaché à la structure existe déjà avec cette adresse mail.')
            : NotifyWarning('L\'apprenant(e) existe déjà et peut être inscrit(e) à la formation sans modification.');
        }
        if (hasCurrentCompany) {
          return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
        }

        user = userInfo.user;
      } else {
        user = await Users.getById(userInfo.user._id);
        const company = get(user, 'company._id');
        userAlreadyHasCompany.value = !!get(user, 'company._id');

        if (company) {
          if (companies.value.includes(company)) {
            const msg = isDirectory
              ? 'Un compte rattaché à la structure existe déjà avec cette adresse mail.'
              : 'L\'apprenant(e) existe déjà et peut être inscrit(e) à la formation sans modification.';

            return NotifyWarning(msg);
          }
          return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
        }
      }

      if (!isDirectory) {
        const isHelperOrAuxiliaryWithoutCompany = [HELPER, AUXILIARY_WITHOUT_COMPANY]
          .includes(get(user, 'role.client.name'));
        if (isHelperOrAuxiliaryWithoutCompany) {
          return NotifyNegative('Cette personne ne peut pas être ajoutée à la formation.');
        }
      }

      setNewLearner(user, lastUserCompany);
      learnerAlreadyExists.value = true;

      return goToNextStep();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
    } finally {
      learnerCreationModalLoading.value = false;
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
      if (learnerAlreadyExists.value) newTrainee.value = await updateLearner();
      else newTrainee.value = await createLearner();

      await refresh();
      learnerCreationModal.value = false;
      traineeAdditionModal.value = true;
    } catch (e) {
      if (e.status === 409) return NotifyNegative(e.data.message);
      NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
    } finally {
      learnerCreationModalLoading.value = false;
    }
  };

  const resetLearnerCreationModal = () => {
    firstStep.value = true;
    newLearner.value = { ...clear(newLearner.value), userCompanyStartDate: CompaniDate().startOf(DAY).toISO() };
    learnerValidation.value.newLearner.$reset();
    userAlreadyHasCompany.value = false;
    learnerAlreadyExists.value = false;
  };

  const updateSearch = (value) => {
    searchStr.value = value;
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
    traineeAdditionModal,
    newTrainee,
    doesLearnerHaveCurrentCompanyAndCandBeLink,
    // Computed
    filteredLearners,
    // Validations
    learnerValidation,
    traineeValidation,
    // Methods
    updateSearch,
    goToNextStep,
    getLearnerList,
    submitLearnerCreationModal,
    resetLearnerCreationModal,
    nextStepLearnerCreationModal,
  };
};
