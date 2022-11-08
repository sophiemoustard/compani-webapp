<template>
  <div v-if="course">
    <div class="profile-container q-mb-xl">
      <ni-bi-color-button v-if="isIntraOrVendor" class="button-history" icon="history" label="Historique"
        @click="toggleHistory" />
      <div v-if="isIntraOrVendor" class="row gutter-profile">
        <ni-input caption="Informations complémentaires" v-model.trim="course.misc"
          @blur="updateCourse('misc')" @focus="saveTmp('misc')" :disable="isArchived" />
      </div>
      <p class="text-weight-bold table-title">Interlocuteurs</p>
      <div class="interlocutor-container">
        <interlocutor-cell :interlocutor="course.salesRepresentative" caption="Référent Compani" :disable="isArchived"
          :open-edition-modal="openSalesRepresentativeModal" :can-update="canUpdateInterlocutor"
          :contact="course.contact" />
        <interlocutor-cell v-if="!!course.trainer._id" :interlocutor="course.trainer" caption="Intervenant(e)"
          :open-edition-modal="() => openTrainerModal('Modifier l\'')" :disable="isArchived" :contact="course.contact"
          :can-update="canUpdateInterlocutor" />
        <ni-button v-else-if="canUpdateInterlocutor" color="primary" icon="add" class="add-interlocutor"
          label="Ajouter un(e) intervenant(e)" :disable="interlocutorModalLoading || isArchived"
          @click="() => openTrainerModal('Ajouter un(e) ')" />
        <interlocutor-cell v-if="!!course.companyRepresentative._id" :interlocutor="course.companyRepresentative"
          caption="Référent structure" :open-edition-modal="() => openCompanyRepresentativeModal('Modifier le ')"
          :disable="isArchived" class="q-mt-lg" :can-update="canUpdateInterlocutor || isClientInterface"
          :contact="course.contact" />
        <ni-button v-else-if="course.type === INTRA" color="primary" icon="add" class="add-interlocutor"
          label="Ajouter un référent structure" :disable="interlocutorModalLoading || isArchived"
          @click="() => openCompanyRepresentativeModal('Ajouter un ')" />
        <ni-button v-if="!course.contact._id && canUpdateInterlocutor" color="primary" icon="add"
          class="add-interlocutor" label="Définir un contact pour la formation"
          :disable="contactModalLoading || isArchived" @click="openContactAdditionModal" />
      </div>
    </div>
    <ni-slot-container :can-edit="canEditSlots" :loading="courseLoading" @refresh="refreshCourse" :is-admin="isAdmin"
      @update="updateCourse('estimatedStartDate')" />
    <ni-company-table v-if="isCourseInter && (isTrainer || isAdmin)" :companies="course.companies" />
    <ni-trainee-table :can-edit="canEditTrainees" :loading="courseLoading" @refresh="refreshCourse"
      @update="updateCourse('maxTrainees')" :validations="v$.course" />
    <q-page-sticky expand position="right">
      <course-history-feed v-if="displayHistory" @toggle-history="toggleHistory" :course-histories="courseHistories"
        @load="updateCourseHistories" ref="courseHistoryFeed" />
    </q-page-sticky>
    <div v-if="isIntraOrVendor">
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contacter les stagiaires</p>
        <ni-banner v-if="missingTraineesPhone.length" icon="info_outline">
          <template #message>
            Il manque le numéro de téléphone de {{ formatQuantity('stagiaire', missingTraineesPhone.length) }} sur
            {{ course.trainees.length }} : {{ missingTraineesPhone.join(', ') }}.
          </template>
        </ni-banner>
        <div class="row">
          <ni-banner v-if="!!smsMissingInfo.length">
            <template #message>
              Il manque {{ formatQuantity('information', smsMissingInfo.length ) }}
              pour envoyer des SMS : {{ smsMissingInfo.join(', ') }}.
            </template>
          </ni-banner>
          <ni-bi-color-button icon="mdi-cellphone-message" :disable="disableSms" @click="openHistoryModal"
            label="Envoyer un SMS aux stagiaires" size="16px" />
          <ni-button color="primary" :disable="!smsHistoryList.length" icon="history" label="Historique d'envoi"
            @click="smsHistoriesModal = true" />
        </div>
        <ni-bi-color-button class="q-my-sm" icon="content_copy" label="Copier les adresses e-mail" @click="copy"
          size="16px" :disable="!traineesEmails" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Documents utiles</p>
      <div class="q-mb-sm">
        <ni-banner v-if="followUpDisabled">
          <template #message>
            Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
            pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
          </template>
        </ni-banner>
        <ni-course-info-link :disable-link="disableDocDownload" @download="downloadConvocation" />
      </div>
      <div v-if="isIntraOrVendor">
        <ni-bi-color-button icon="file_download" label="Feuilles d'émargement vierges"
          :disable="disableDocDownload" @click="downloadAttendanceSheet" size="16px" />
      </div>
    </div>

    <sms-sending-modal v-model="smsModal" :filtered-message-type-options="filteredMessageTypeOptions" :loading="loading"
      v-model:new-sms="newSms" @send="sendMessage" @update-type="updateMessage" :error="v$.newSms"
      @hide="resetSmsModal" />

    <sms-history-modal v-model="smsHistoriesModal" :sms-history-list="smsHistoryList" :send-sms="sendSms"
      :message-type-options="messageTypeOptions" @submit="openSmsModal" @hide="sendSms = false" />

    <interlocutor-modal v-model="salesRepresentativeEditionModal" v-model:interlocutor="tempInterlocutor"
      @submit="updateInterlocutor('salesRepresentative')" :validations="v$.tempInterlocutor"
      :loading="interlocutorModalLoading" @hide="resetSalesRepresentativeEdition" :label="salesRepresentativeLabel"
      :interlocutors-options="salesRepresentativeOptions" :show-contact="canUpdateInterlocutor" />

    <interlocutor-modal v-model="trainerModal" v-model:interlocutor="tempInterlocutor" @hide="resetInterlocutor"
      @submit="updateInterlocutor('trainer')" :validations="v$.tempInterlocutor" :loading="interlocutorModalLoading"
      :label="interlocutorLabel" :interlocutors-options="trainerOptions" :show-contact="canUpdateInterlocutor" />

    <interlocutor-modal v-model="companyRepresentativeModal" v-model:interlocutor="tempInterlocutor"
      @submit="updateInterlocutor('companyRepresentative')" :validations="v$.tempInterlocutor"
      :loading="interlocutorModalLoading" @hide="resetInterlocutor" :label="interlocutorLabel"
      :interlocutors-options="companyRepresentativeOptions" :show-contact="canUpdateInterlocutor" />

    <contact-addition-modal v-model="contactAdditionModal" v-model:contact="tempContactId"
      @submit="updateContact" :validations="v$.tempContactId" :loading="contactModalLoading"
      @hide="resetContactAddition" :contact-options="contactOptions" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, ref, toRefs, watch } from 'vue';
import { copyToClipboard } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import Users from '@api/Users';
import CourseHistories from '@api/CourseHistories';
import Roles from '@api/Roles';
import Courses from '@api/Courses';
import Input from '@components/form/Input';
import Button from '@components/Button';
import SlotContainer from '@components/courses/SlotContainer';
import TraineeTable from '@components/courses/TraineeTable';
import CompanyTable from '@components/courses/CompanyTable';
import CourseInfoLink from '@components/courses/CourseInfoLink';
import CourseHistoryFeed from '@components/courses/CourseHistoryFeed';
import SmsSendingModal from '@components/courses/SmsSendingModal';
import CourseSmsHistoryModal from '@components/courses/CourseSmsHistoryModal';
import InterlocutorCell from '@components/courses/InterlocutorCell';
import InterlocutorModal from '@components/courses/InterlocutorModal';
import CourseContactAdditionModal from '@components/courses/CourseContactAdditionModal';
import Banner from '@components/Banner';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import {
  INTER_B2B,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
  TRAINER,
  CONVOCATION,
  REMINDER,
  OTHER,
  COACH,
  CLIENT_ADMIN,
  INTRA,
  DEFAULT_AVATAR,
  DD_MM,
  HH_MM,
} from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';
import { composeCourseName } from '@helpers/courses';
import { formatQuantity, formatIdentity, formatDownloadName, formatPhoneForPayload } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import CompaniDate from '@helpers/dates/companiDates';
import { descendingSortBy, ascendingSortBy } from '@helpers/dates/utils';
import { strictPositiveNumber, integerNumber } from '@helpers/vuelidateCustomVal';
import BiColorButton from '@components/BiColorButton';
import { useCourses } from '@composables/courses';

export default {
  name: 'ProfileOrganization',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-slot-container': SlotContainer,
    'ni-company-table': CompanyTable,
    'ni-trainee-table': TraineeTable,
    'ni-course-info-link': CourseInfoLink,
    'ni-banner': Banner,
    'course-history-feed': CourseHistoryFeed,
    'ni-bi-color-button': BiColorButton,
    'sms-sending-modal': SmsSendingModal,
    'sms-history-modal': CourseSmsHistoryModal,
    'ni-button': Button,
    'interlocutor-cell': InterlocutorCell,
    'interlocutor-modal': InterlocutorModal,
    'contact-addition-modal': CourseContactAdditionModal,
  },
  setup (props) {
    const { profileId } = toRefs(props);

    const $store = useStore();

    const trainerOptions = ref([]);
    const salesRepresentativeOptions = ref([]);
    const companyRepresentativeOptions = ref([]);
    const courseLoading = ref(false);
    const tmpInput = ref('');
    const displayHistory = ref(false);
    const courseHistories = ref([]);
    const smsModal = ref(false);
    const messageTypeOptions = ref([
      { label: 'Convocation', value: CONVOCATION },
      { label: 'Rappel', value: REMINDER },
      { label: 'Autre', value: OTHER },
    ]);
    const newSms = ref({ content: '', type: '' });
    const loading = ref(false);
    const smsHistoryList = ref([]);
    const smsLoading = ref(false);
    const smsHistoriesModal = ref(false);
    const urlAndroid = ref('https://bit.ly/3en5OkF');
    const urlIos = ref('https://apple.co/33kKzcU');
    const tempInterlocutor = ref({ _id: '', isContact: false });
    const salesRepresentativeLabel = ref({ action: 'Modifier le ', interlocutor: 'référent Compani' });
    const salesRepresentativeEditionModal = ref(false);
    const interlocutorModalLoading = ref(false);
    const interlocutorLabel = ref({ action: '', interlocutor: '' });
    const trainerModal = ref(false);
    const sendSms = ref(false);
    const companyRepresentativeModal = ref(false);
    const contactModalLoading = ref(false);
    const contactAdditionModal = ref(false);
    const tempContactId = ref('');
    const SALES_REPRESENTATIVE = ref('salesRepresentative');
    const COMPANY_REPRESENTATIVE = ref('companyRepresentative');
    const courseHistoryFeed = ref(null);

    const course = computed(() => $store.state.course.course);

    const {
      vendorRole,
      isIntraCourse,
      disableDocDownload,
      pdfLoading,
      isClientInterface,
      isVendorInterface,
      isIntraOrVendor,
      followUpDisabled,
      isArchived,
      followUpMissingInfo,
      downloadAttendanceSheet,
    } = useCourses(course);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const rules = computed(() => ({
      tempInterlocutor: { _id: { required } },
      tempContactId: { required },
      course: { maxTrainees: { strictPositiveNumber, integerNumber } },
      newSms: { content: { required }, type: { required } },
    }));

    const v$ = useVuelidate(rules, { tempInterlocutor, tempContactId, course, newSms });

    const isTrainer = computed(() => vendorRole.value === TRAINER);

    const isAdmin = computed(() => [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole.value));

    const isCourseInter = computed(() => course.value.type === INTER_B2B);

    const canEditSlots = computed(() => !(isClientInterface && isCourseInter.value));

    const canEditTrainees = computed(() => isIntraCourse.value || (!isClientInterface && !isTrainer.value));

    const isFinished = computed(() => {
      const slotsToCome = course.value.slots.filter(slot => CompaniDate().isBefore(slot.endDate));
      return !slotsToCome.length && !course.value.slotsToPlan.length;
    });

    const courseNotStartedYet = computed(() => {
      const slots = course.value.slots.filter(slot => CompaniDate().isAfter(slot.endDate));
      return !slots.length;
    });

    const filteredMessageTypeOptions = computed(() => {
      if (courseNotStartedYet.value) return messageTypeOptions.value;
      if (isFinished.value || noFuturSlotIsPlanned.value) {
        return messageTypeOptions.value.filter(t => t.value === OTHER);
      }
      return messageTypeOptions.value.filter(t => t.value !== CONVOCATION);
    });

    const missingTraineesPhone = computed(() => course.value.trainees.filter(trainee => !get(trainee, 'contact.phone'))
      .map(trainee => formatIdentity(trainee.identity, 'FL')));

    const courseName = computed(() => composeCourseName(course.value));

    const noFuturSlotIsPlanned = computed(() => {
      const futurSlots = course.value.slots.filter(s => s.startDate).filter(s => CompaniDate().isBefore(s.startDate));
      return !!course.value.slotsToPlan.length && !futurSlots.length;
    });

    const smsMissingInfo = computed(() => {
      const missingInfo = [];
      if (!course.value.slots || !course.value.slots.length) missingInfo.push('minimum 1 créneau');
      if (!course.value.trainees || !course.value.trainees.length) missingInfo.push('minimum 1 stagiaire');

      return missingInfo;
    });

    const disableSms = computed(() => {
      const noPhoneNumber = missingTraineesPhone.value.length === course.value.trainees.length;

      return !!smsMissingInfo.value.length || noPhoneNumber;
    });

    const canUpdateInterlocutor = computed(() => {
      const ability = defineAbilitiesFor(pick(loggedUser.value, ['role']));

      return ability.can('update', 'interlocutor');
    });

    const traineesEmails = computed(() => {
      if (!course.value.trainees) return '';

      return course.value.trainees.map(trainee => trainee.local.email).reduce((acc, value) => `${acc}${value},`, '');
    });

    const contactOptions = computed(() => {
      const interlocutors = [
        { interlocutor: course.value.salesRepresentative, role: 'Référent(e) Compani' },
        ...(course.value.trainer._id ? [{ interlocutor: course.value.trainer, role: 'Intervenant(e)' }] : []),
        ...(course.value.companyRepresentative._id
          ? [{ interlocutor: course.value.companyRepresentative, role: 'Référent(e) structure' }]
          : []),
      ];
      return Object.freeze(interlocutors.map(interlocutor => formatContactOption(interlocutor)));
    });

    watch(course, () => {
      const phoneValidation = get(v$.value, 'course.contact.contact.phone');
      if (phoneValidation) phoneValidation.$touch();
    });

    const toggleHistory = async () => {
      displayHistory.value = !displayHistory.value;
      if (displayHistory.value) await getCourseHistories();
      else courseHistories.value = [];
    };

    const getCourseHistories = async (createdAt = null) => {
      const courseHistoriesTmp = cloneDeep(courseHistories.value);
      try {
        let olderCourseHistories;
        if (createdAt) {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: profileId.value, createdAt });
          courseHistories.value.push(...olderCourseHistories);
        } else {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: profileId.value });
          courseHistories.value = olderCourseHistories;
        }

        return olderCourseHistories;
      } catch (e) {
        courseHistories.value = courseHistoriesTmp;
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de l\'historique d\'activité');
      }
    };

    const updateCourseHistories = async (done) => {
      const lastCreatedAt = courseHistories.value.length
        ? courseHistories.value[courseHistories.value.length - 1].createdAt
        : null;
      const olderCourseHistories = await getCourseHistories(lastCreatedAt);

      return done(!olderCourseHistories.length);
    };

    const refreshCourse = async () => {
      try {
        courseLoading.value = true;
        await $store.dispatch('course/fetchCourse', { courseId: profileId.value });
        if (displayHistory.value) {
          await getCourseHistories();
          courseHistoryFeed.value.resumeScroll();
        }
      } catch (e) {
        console.error(e);
      } finally {
        courseLoading.value = false;
      }
    };

    const formatInterlocutorOption = interlocutor => ({
      value: interlocutor._id,
      label: formatIdentity(interlocutor.identity, 'FL'),
      email: interlocutor.local.email || '',
      picture: get(interlocutor, 'picture.link') || DEFAULT_AVATAR,
      additionalFilters: [interlocutor.local.email],
    });

    const formatContactOption = contact => ({
      value: contact.interlocutor._id,
      label: `${formatIdentity(contact.interlocutor.identity, 'FL')} - ${contact.role}`,
    });

    const refreshCompanyRepresentatives = async () => {
      try {
        const loggedUserCompany = get(loggedUser.value, 'company._id');
        const courseCompany = course.value.type === INTRA ? course.value.companies[0]._id : '';

        if (isTrainer.value && loggedUserCompany !== courseCompany) {
          companyRepresentativeOptions.value = [];
          return;
        }
        const clientUsersFromCompany = course.value.type === INTRA
          ? await Users.list({ role: [COACH, CLIENT_ADMIN], company: courseCompany })
          : [];

        companyRepresentativeOptions.value = Object.freeze(clientUsersFromCompany
          .map(user => formatInterlocutorOption(user)).sort((a, b) => a.label.localeCompare(b.label)));
      } catch (e) {
        console.error(e);
      }
    };

    const refreshTrainersAndSalesRepresentatives = async () => {
      try {
        const vendorUsers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        trainerOptions.value = Object.freeze(
          vendorUsers.map(vu => formatInterlocutorOption(vu)).sort((a, b) => a.label.localeCompare(b.label))
        );
        const [trainerRole] = await Roles.list({ name: [TRAINER] });
        const salesRepresentatives = vendorUsers.filter(t => t.role.vendor !== trainerRole._id);
        salesRepresentativeOptions.value = salesRepresentatives
          .map(sr => formatInterlocutorOption(sr))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        trainerOptions.value = [];
        salesRepresentativeOptions.value = [];
      }
    };

    const setDefaultMessageType = () => {
      if (courseNotStartedYet.value) newSms.value.type = CONVOCATION;
      else if (isFinished.value || noFuturSlotIsPlanned.value) newSms.value.type = OTHER;
      else newSms.value.type = REMINDER;
    };

    const refreshSms = async () => {
      try {
        smsLoading.value = true;
        const smsList = await Courses.getSMSHistory(course.value._id);
        smsHistoryList.value = smsList.sort(descendingSortBy('date'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des sms');
        smsHistoryList.value = [];
      } finally {
        smsLoading.value = false;
      }
    };

    const openHistoryModal = async () => {
      if (smsHistoryList.value.length) {
        smsHistoriesModal.value = true;
        sendSms.value = true;
      } else {
        openSmsModal();
      }
    };

    const openSmsModal = () => {
      setDefaultMessageType();
      updateMessage(newSms.value.type);
      smsHistoriesModal.value = false;
      sendSms.value = false;
      smsModal.value = true;
    };

    const resetSmsModal = () => v$.value.newSms.$reset();

    const setConvocationMessage = () => {
      const slots = course.value.slots
        .filter(s => !!s.startDate)
        .sort(ascendingSortBy('startDate'));
      const date = CompaniDate(slots[0].startDate).format(DD_MM);
      const hour = CompaniDate(slots[0].startDate).format(HH_MM);

      newSms.value.content = `Bonjour,\nVous êtes inscrit(e) à la formation ${courseName.value}.\n`
      + `La première session a lieu le ${date} à ${hour}.\nPour le bon déroulement et le suivi `
      + 'de cette formation, veuillez télécharger notre application Compani :\n'
      + `Pour android : ${urlAndroid.value} \nPour iPhone : ${urlIos.value}\n`
      + 'Bonne formation,\nCompani';
    };

    const setReminderMessage = () => {
      const slots = course.value.slots
        .filter(s => !!s.startDate)
        .filter(slot => CompaniDate().isBefore(slot.endDate))
        .sort(ascendingSortBy('startDate'));
      const date = CompaniDate(slots[0].startDate).format(DD_MM);
      const hour = CompaniDate(slots[0].startDate).format(HH_MM);

      newSms.value.content = `Bonjour,\nRAPPEL : vous êtes inscrit(e) à la formation ${courseName.value}.\n`
      + `Votre prochaine session a lieu le ${date} à ${hour}.\nPour le bon déroulement et le suivi `
      + 'de cette formation, veuillez télécharger notre application Compani :\n'
      + `Pour android : ${urlAndroid.value} \nPour iPhone : ${urlIos.value} `
      + '\nBonne formation,\nCompani';
    };

    const setOtherMessage = () => (newSms.value.content = '');

    const updateMessage = (newMessageType) => {
      if (newMessageType === CONVOCATION) setConvocationMessage();
      else if (newMessageType === REMINDER) setReminderMessage();
      else if (newMessageType === OTHER) setOtherMessage();
    };

    const sendMessage = async () => {
      try {
        v$.value.newSms.$touch();
        if (v$.value.newSms.$error) return NotifyWarning('Champ(s) invalide(s)');

        loading.value = true;
        await Courses.sendSMS(course.value._id, newSms.value);
        await refreshSms();

        smsModal.value = false;

        return NotifyPositive('SMS bien envoyé(s).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi des SMS');
      } finally {
        loading.value = false;
        setDefaultMessageType();
      }
    };

    const downloadConvocation = async () => {
      if (disableDocDownload.value) return;

      try {
        pdfLoading.value = true;
        const pdf = await Courses.downloadConvocation(course.value._id);
        const formattedName = formatDownloadName(`convocation ${composeCourseName(course.value, true)}`);
        const pdfName = `${formattedName}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la convocation.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const updateInterlocutor = async (role) => {
      try {
        interlocutorModalLoading.value = true;
        v$.value.tempInterlocutor.$touch();
        if (v$.value.tempInterlocutor.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = {
          [role]: tempInterlocutor.value._id,
          ...(
            (
              tempInterlocutor.value.isContact ||
              get(course.value, 'contact._id') === get(course.value, `${role}._id`)
            ) &&
            { contact: tempInterlocutor.value.isContact ? tempInterlocutor.value._id : '' }
          ),
        };

        await Courses.update(profileId.value, payload);

        switch (role) {
          case SALES_REPRESENTATIVE.value: salesRepresentativeEditionModal.value = false;
            break;
          case TRAINER: trainerModal.value = false;
            break;
          case COMPANY_REPRESENTATIVE.value: companyRepresentativeModal.value = false;
            break;
        }
        await refreshCourse();
        NotifyPositive('Interlocuteur mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'interlocuteur.');
      } finally {
        interlocutorModalLoading.value = false;
      }
    };

    const updateContact = async () => {
      try {
        contactModalLoading.value = true;
        v$.value.tempContactId.$touch();
        if (v$.value.tempContactId.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.update(profileId.value, { contact: tempContactId.value });
        contactAdditionModal.value = false;
        await refreshCourse();
        NotifyPositive('Contact mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition du contact.');
      } finally {
        contactModalLoading.value = false;
      }
    };

    const resetContactAddition = () => {
      tempContactId.value = '';
      v$.value.tempContactId.$reset();
    };

    const resetSalesRepresentativeEdition = () => {
      tempInterlocutor.value = { _id: '', isContact: false };
      v$.value.tempInterlocutor.$reset();
    };

    const openSalesRepresentativeModal = () => {
      tempInterlocutor.value = {
        _id: course.value.salesRepresentative._id,
        isContact: course.value.salesRepresentative._id === course.value.contact._id,
      };
      salesRepresentativeEditionModal.value = true;
    };

    const resetInterlocutor = () => {
      tempInterlocutor.value = { _id: '', isContact: false };
      interlocutorLabel.value = { action: '', interlocutor: '' };
      v$.value.tempInterlocutor.$reset();
    };

    const openTrainerModal = (action) => {
      tempInterlocutor.value = {
        _id: course.value.trainer._id,
        isContact: !!course.value.trainer._id && course.value.trainer._id === course.value.contact._id,
      };
      interlocutorLabel.value = { action, interlocutor: 'intervenant(e)' };
      trainerModal.value = true;
    };

    const openCompanyRepresentativeModal = (action) => {
      tempInterlocutor.value = {
        _id: course.value.companyRepresentative._id,
        isContact: !!course.value.companyRepresentative._id &&
        course.value.companyRepresentative._id === course.value.contact._id,
      };
      interlocutorLabel.value = { action, interlocutor: 'Référent structure' };
      companyRepresentativeModal.value = true;
    };

    const openContactAdditionModal = () => {
      tempContactId.value = course.value.contact._id;
      contactAdditionModal.value = true;
    };

    const copy = () => {
      copyToClipboard(traineesEmails.value)
        .then(() => NotifyPositive('Adresses mail copiées !'))
        .catch(() => NotifyNegative('Erreur lors de la copie des emails.'));
    };

    const getValue = (path) => {
      if (path === 'trainer') return get(course.value, 'trainer._id', '');
      if (path === 'salesRepresentative') return get(course.value, 'salesRepresentative._id', '');
      if (path === 'contact') return get(course.value, 'contact._id', '');

      return get(course.value, path);
    };

    const saveTmp = (path) => {
      tmpInput.value = getValue(path);
    };

    const formatUpdateCourseValue = (path, value) => (path === 'contact.phone' ? formatPhoneForPayload(value) : value);

    const updateCourse = async (path) => {
      try {
        const value = getValue(path);
        if (tmpInput.value === value) return;

        const vAttribute = get(v$.value, `course.${path}`);
        if (vAttribute) {
          vAttribute.$touch();
          if (vAttribute.$error) return NotifyWarning('Champ(s) invalide(s).');
        }

        const payload = set({}, path, formatUpdateCourseValue(path, value));
        await Courses.update(profileId.value, payload);
        NotifyPositive('Modification enregistrée.');

        await refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        if (e.status === 403 && e.data.message) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        tmpInput.value = null;
      }
    };

    const created = async () => {
      const promises = [refreshCourse()];
      if (isVendorInterface || isIntraCourse.value) {
        promises.push(refreshSms(), refreshCompanyRepresentatives());
      }
      await Promise.all(promises);

      if (isAdmin.value) await refreshTrainersAndSalesRepresentatives();
      else {
        salesRepresentativeOptions.value = [formatInterlocutorOption(course.value.salesRepresentative)];
      }
    };

    created();

    return {
      // Data
      INTRA,
      trainerOptions,
      salesRepresentativeOptions,
      companyRepresentativeOptions,
      courseLoading,
      displayHistory,
      courseHistories,
      smsModal,
      messageTypeOptions,
      newSms,
      loading,
      smsHistoryList,
      smsHistoriesModal,
      tempInterlocutor,
      salesRepresentativeLabel,
      salesRepresentativeEditionModal,
      interlocutorModalLoading,
      interlocutorLabel,
      trainerModal,
      sendSms,
      companyRepresentativeModal,
      contactModalLoading,
      contactAdditionModal,
      tempContactId,
      courseHistoryFeed,
      // Computed
      course,
      v$,
      isAdmin,
      canEditSlots,
      canEditTrainees,
      filteredMessageTypeOptions,
      missingTraineesPhone,
      smsMissingInfo,
      disableSms,
      canUpdateInterlocutor,
      traineesEmails,
      contactOptions,
      isIntraOrVendor,
      disableDocDownload,
      followUpDisabled,
      isArchived,
      followUpMissingInfo,
      isClientInterface,
      isCourseInter,
      isTrainer,
      // Methods
      get,
      formatQuantity,
      toggleHistory,
      updateCourseHistories,
      refreshCourse,
      formatContactOption,
      openHistoryModal,
      openSmsModal,
      resetSmsModal,
      updateMessage,
      sendMessage,
      downloadConvocation,
      updateInterlocutor,
      updateContact,
      resetContactAddition,
      resetSalesRepresentativeEdition,
      openSalesRepresentativeModal,
      resetInterlocutor,
      openTrainerModal,
      openCompanyRepresentativeModal,
      openContactAdditionModal,
      copy,
      saveTmp,
      updateCourse,
      downloadAttendanceSheet,
    };
  },
};
</script>

<style lang="sass" scoped>
.profile-container
  display: flex
  flex-direction: column
.button-history
  align-self: flex-end
.interlocutor-container
  flex-direction: row
  grid-auto-flow: row
  display: grid
  grid-template-columns: repeat(2, 1fr)
.add-interlocutor
  justify-self: start
  align-self: end
  margin-top: 24px
</style>
