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
          :disable="isArchived" class="q-mt-lg" can-update :contact="course.contact" />
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
    <ni-trainee-table :can-edit="canEditTrainees" :loading="courseLoading" @refresh="refreshCourse" />
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
      v-model:new-sms="newSms" @send="sendMessage" @update-type="updateMessage" @hide="resetSmsModal" />

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
import { mapState } from 'vuex';
import { copyToClipboard } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
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
  COACH,
  CLIENT_ADMIN,
  INTRA,
  DEFAULT_AVATAR,
} from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';
import { formatQuantity, formatIdentity, formatDownloadName } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';
import { descendingSort, ascendingSort } from '@helpers/date';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import BiColorButton from '@components/BiColorButton';

export default {
  name: 'ProfileOrganization',
  mixins: [userMixin, courseMixin],
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-slot-container': SlotContainer,
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
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      trainerOptions: [],
      salesRepresentativeOptions: [],
      companyRepresentativeOptions: [],
      courseLoading: false,
      courseSlotsLoading: false,
      tmpInput: '',
      isClientInterface,
      displayHistory: false,
      courseHistories: [],
      smsModal: false,
      messageTypeOptions: [{ label: 'Convocation', value: CONVOCATION }, { label: 'Rappel', value: REMINDER }],
      newSms: { content: '', type: '' },
      loading: false,
      smsHistoryList: [],
      pagination: { rowsPerPage: 0 },
      smsLoading: false,
      smsHistoriesModal: false,
      urlAndroid: 'https://bit.ly/3en5OkF',
      urlIos: 'https://apple.co/33kKzcU',
      tempInterlocutor: { _id: '', isContact: false },
      salesRepresentativeLabel: { action: 'Modifier le ', interlocutor: 'référent Compani' },
      salesRepresentativeEditionModal: false,
      interlocutorModalLoading: false,
      interlocutorLabel: { action: '', interlocutor: '' },
      trainerModal: false,
      sendSms: false,
      INTRA,
      companyRepresentativeModal: false,
      contactModalLoading: false,
      contactAdditionModal: false,
      tempContactId: '',
      SALES_REPRESENTATIVE: 'salesRepresentative',
      COMPANY_REPRESENTATIVE: 'companyRepresentative',
    };
  },
  validations () {
    return {
      tempInterlocutor: { _id: { required } },
      tempContactId: { required },
      course: { contact: { contact: { phone: { required } } } },
      newSms: { content: { required }, type: { required } },
    };
  },
  watch: {
    course () {
      const phoneValidation = get(this.v$, 'course.contact.contact.phone');
      if (phoneValidation) phoneValidation.$touch();
    },
  },
  computed: {
    ...mapState('course', ['course']),
    ...mapState('main', ['loggedUser']),
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    isCourseInter () {
      return this.course.type === INTER_B2B;
    },
    canEditSlots () {
      return !(this.isClientInterface && this.isCourseInter);
    },
    canEditTrainees () {
      return this.isIntraCourse || (!this.isClientInterface && !this.isTrainer);
    },
    missingInfoMsg () {
      return `Le lien vers la page sera disponible dès que l'équipe aura rentré ${
        this.followUpMissingInfo.length > 1 ? 'les informations manquantes : ' : 'l\'information manquante : '
      }${this.followUpMissingInfo.join(', ')}`;
    },
    isFinished () {
      const slots = this.course.slots.filter(slot => moment().isBefore(slot.startDate));
      return !slots.length && !this.course.slotsToPlan.length;
    },
    courseNotStartedYet () {
      const slots = this.course.slots.filter(slot => moment().isAfter(slot.endDate));
      return !slots.length;
    },
    courseLink () {
      return Courses.getConvocationUrl(this.course._id);
    },
    filteredMessageTypeOptions () {
      return this.courseNotStartedYet
        ? this.messageTypeOptions
        : this.messageTypeOptions.filter(t => t.value === REMINDER);
    },
    missingTraineesPhone () {
      return this.course.trainees.filter(trainee => !get(trainee, 'contact.phone'))
        .map(trainee => formatIdentity(trainee.identity, 'FL'));
    },
    courseName () {
      return this.composeCourseName(this.course);
    },
    allFuturSlotsAreNotPlanned () {
      const futurSlots = this.course.slots.filter(s => s.startDate).filter(s => moment().isBefore(s.startDate));
      return !!this.course.slotsToPlan.length && !futurSlots.length;
    },
    smsMissingInfo () {
      const missingInfo = [];
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('minimum 1 créneau');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('minimum 1 stagiaire');

      return missingInfo;
    },
    disableSms () {
      const noPhoneNumber = this.missingTraineesPhone.length === this.course.trainees.length;

      return !!this.smsMissingInfo.length || noPhoneNumber;
    },
    isMissingContactPhone () {
      return !!get(this.course, 'contact._id') && get(this.v$, 'course.contact.contact.phone.$error');
    },
    canUpdateInterlocutor () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role']));

      return ability.can('update', 'interlocutor');
    },
    traineesEmails () {
      if (!this.course.trainees) return '';

      return this.course.trainees.map(trainee => trainee.local.email).reduce((acc, value) => `${acc}${value},`, '');
    },
    contactOptions () {
      const interlocutors = [
        { interlocutor: this.course.salesRepresentative, role: 'Référent(e) Compani' },
        ...(this.course.trainer._id ? [{ interlocutor: this.course.trainer, role: 'Intervenant(e)' }] : []),
        ...(this.course.companyRepresentative._id
          ? [{ interlocutor: this.course.companyRepresentative, role: 'Référent(e) structure' }]
          : []),
      ];
      return Object.freeze(interlocutors.map(interlocutor => this.formatContactOption(interlocutor)));
    },
  },

  async created () {
    const promises = [this.refreshCourse()];
    if (this.isVendorInterface || this.isIntraCourse) {
      promises.push(this.refreshSms(), this.refreshCompanyRepresentatives());
    }
    await Promise.all(promises);
    this.setDefaultMessageType();

    if (this.isAdmin) await this.refreshTrainersAndSalesRepresentatives();
    else {
      this.salesRepresentativeOptions = [this.formatInterlocutorOption(this.course.salesRepresentative)];
    }
  },
  methods: {
    get,
    formatQuantity,
    async toggleHistory () {
      this.displayHistory = !this.displayHistory;
      if (this.displayHistory) await this.getCourseHistories();
      else this.courseHistories = [];
    },
    async getCourseHistories (createdAt = null) {
      const courseHistoriesTmp = cloneDeep(this.courseHistories);
      try {
        let olderCourseHistories;
        if (createdAt) {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: this.profileId, createdAt });
          this.courseHistories.push(...olderCourseHistories);
        } else {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: this.profileId });
          this.courseHistories = olderCourseHistories;
        }

        return olderCourseHistories;
      } catch (e) {
        this.courseHistories = courseHistoriesTmp;
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de l\'historique d\'activité');
      }
    },
    async updateCourseHistories (done) {
      const lastCreatedAt = this.courseHistories.length
        ? this.courseHistories[this.courseHistories.length - 1].createdAt
        : null;
      const olderCourseHistories = await this.getCourseHistories(lastCreatedAt);

      return done(!olderCourseHistories.length);
    },
    async refreshCourse () {
      try {
        this.courseLoading = true;
        await this.$store.dispatch('course/fetchCourse', { courseId: this.profileId });
        if (this.displayHistory) {
          await this.getCourseHistories();
          this.$refs.courseHistoryFeed.resumeScroll();
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.courseLoading = false;
      }
    },
    formatInterlocutorOption (interlocutor) {
      return {
        value: interlocutor._id,
        label: formatIdentity(interlocutor.identity, 'FL'),
        email: interlocutor.local.email || '',
        picture: get(interlocutor, 'picture.link') || DEFAULT_AVATAR,
        additionalFilters: [interlocutor.local.email],
      };
    },
    formatContactOption (contact) {
      return {
        value: contact.interlocutor._id,
        label: `${formatIdentity(contact.interlocutor.identity, 'FL')} - ${contact.role}`,
      };
    },
    async refreshCompanyRepresentatives () {
      try {
        const clientUsersFromCompany = this.course.type === INTRA
          ? await Users.list({ role: [COACH, CLIENT_ADMIN], company: this.course.company._id })
          : [];
        this.companyRepresentativeOptions = Object.freeze(clientUsersFromCompany
          .map(user => this.formatInterlocutorOption(user)).sort((a, b) => a.label.localeCompare(b.label)));
      } catch (e) {
        console.error(e);
      }
    },
    async refreshTrainersAndSalesRepresentatives () {
      try {
        const vendorUsers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerOptions = Object.freeze(
          vendorUsers.map(vu => this.formatInterlocutorOption(vu)).sort((a, b) => a.label.localeCompare(b.label))
        );
        const [trainerRole] = await Roles.list({ name: [TRAINER] });
        const salesRepresentatives = vendorUsers.filter(t => t.role.vendor !== trainerRole._id);
        this.salesRepresentativeOptions = salesRepresentatives
          .map(sr => this.formatInterlocutorOption(sr))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.trainerOptions = [];
        this.salesRepresentativeOptions = [];
      }
    },
    getType (value) {
      const type = this.messageTypeOptions.find(t => t.value === value);
      return type ? type.label : '';
    },
    setDefaultMessageType () {
      this.newSms.type = this.courseNotStartedYet ? CONVOCATION : REMINDER;
    },
    async refreshSms () {
      try {
        this.smsLoading = true;
        const smsList = await Courses.getSMSHistory(this.course._id);
        this.smsHistoryList = smsList.sort((a, b) => descendingSort(a.date, b.date));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des sms');
        this.smsHistoryList = [];
      } finally {
        this.smsLoading = false;
      }
    },
    openHistoryModal () {
      if (this.allFuturSlotsAreNotPlanned) {
        return NotifyWarning('Vous ne pouvez pas envoyer des sms pour une formation sans créneaux à venir.');
      }
      if (this.isFinished) return NotifyWarning('Vous ne pouvez pas envoyer des sms pour une formation terminée.');

      if (this.smsHistoryList.length) {
        this.smsHistoriesModal = true;
        this.sendSms = true;
      } else {
        this.openSmsModal();
      }
    },
    openSmsModal () {
      this.updateMessage(this.newSms.type);
      this.smsHistoriesModal = false;
      this.sendSms = false;
      this.smsModal = true;
    },
    resetSmsModal () {
      this.updateMessage(this.newSms.type);
    },
    updateMessage (newMessageType) {
      if (newMessageType === CONVOCATION) this.setConvocationMessage();
      else if (newMessageType === REMINDER) this.setReminderMessage();
    },
    setConvocationMessage () {
      const slots = this.course.slots
        .filter(s => !!s.startDate)
        .sort((a, b) => ascendingSort(a.startDate, b.startDate));
      const date = moment(slots[0].startDate).format('DD/MM');
      const hour = moment(slots[0].startDate).format('HH:mm');

      this.newSms.content = `Bonjour,\nVous êtes inscrit(e) à la formation ${this.courseName}.\n`
      + `La première session a lieu le ${date} à ${hour}.\nPour le bon déroulement et le suivi `
      + 'de cette formation, veuillez télécharger notre application Compani :\n'
      + `Pour android : ${this.urlAndroid} \nPour iPhone : ${this.urlIos}\n`
      + 'Bonne formation,\nCompani';
    },
    setReminderMessage () {
      const slots = this.course.slots
        .filter(s => !!s.startDate)
        .filter(slot => moment().isBefore(slot.startDate))
        .sort((a, b) => ascendingSort(a.startDate, b.startDate));
      const date = moment(slots[0].startDate).format('DD/MM');
      const hour = moment(slots[0].startDate).format('HH:mm');

      this.newSms.content = `Bonjour,\nRAPPEL : vous êtes inscrit(e) à la formation ${this.courseName}.\n`
      + `Votre prochaine session a lieu le ${date} à ${hour}.\nPour le bon déroulement et le suivi `
      + 'de cette formation, veuillez télécharger notre application Compani :\n'
      + `Pour android : ${this.urlAndroid} \nPour iPhone : ${this.urlIos} `
      + '\nBonne formation,\nCompani';
    },
    async sendMessage () {
      try {
        this.v$.newSms.$touch();
        if (this.v$.newSms.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await Courses.sendSMS(this.course._id, this.newSms);
        await this.refreshSms();

        this.smsModal = false;

        return NotifyPositive('SMS bien envoyé(s).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi des SMS');
      } finally {
        this.loading = false;
        this.message = '';
        this.setDefaultMessageType();
      }
    },
    async downloadConvocation () {
      if (this.disableDocDownload) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadConvocation(this.course._id);
        const formattedName = formatDownloadName(`convocation ${this.composeCourseName(this.course, true)}`);
        const pdfName = `${formattedName}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la convocation.');
      } finally {
        this.pdfLoading = false;
      }
    },
    async updateInterlocutor (role) {
      try {
        this.interlocutorModalLoading = true;
        this.v$.tempInterlocutor.$touch();
        if (this.v$.tempInterlocutor.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = {
          [role]: this.tempInterlocutor._id,
          ...(
            (
              this.tempInterlocutor.isContact ||
              get(this.course, 'contact._id') === get(this.course, `${role}._id`)
            ) &&
            { contact: this.tempInterlocutor.isContact ? this.tempInterlocutor._id : '' }
          ),
        };

        await Courses.update(this.profileId, payload);

        switch (role) {
          case this.SALES_REPRESENTATIVE: this.salesRepresentativeEditionModal = false;
            break;
          case TRAINER: this.trainerModal = false;
            break;
          case this.COMPANY_REPRESENTATIVE: this.companyRepresentativeModal = false;
            break;
        }
        await this.refreshCourse();
        NotifyPositive('Interlocuteur mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'interlocuteur.');
      } finally {
        this.interlocutorModalLoading = false;
      }
    },
    async updateContact () {
      try {
        this.contactModalLoading = true;
        this.v$.tempContactId.$touch();
        if (this.v$.tempContactId.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.update(this.profileId, { contact: this.tempContactId });
        this.contactAdditionModal = false;
        await this.refreshCourse();
        NotifyPositive('Contact mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition du contact.');
      } finally {
        this.contactModalLoading = false;
      }
    },
    resetContactAddition () {
      this.tempContactId = '';
      this.v$.tempContactId.$reset();
    },
    resetSalesRepresentativeEdition () {
      this.tempInterlocutor = { _id: '', isContact: false };
      this.v$.tempInterlocutor.$reset();
    },
    openSalesRepresentativeModal () {
      this.tempInterlocutor = {
        _id: this.course.salesRepresentative._id,
        isContact: this.course.salesRepresentative._id === this.course.contact._id,
      };
      this.salesRepresentativeEditionModal = true;
    },
    resetInterlocutor () {
      this.tempInterlocutor = { _id: '', isContact: false };
      this.interlocutorLabel = { action: '', interlocutor: '' };
      this.v$.tempInterlocutor.$reset();
    },
    openTrainerModal (action) {
      this.tempInterlocutor = {
        _id: this.course.trainer._id,
        isContact: !!this.course.trainer._id && this.course.trainer._id === this.course.contact._id,
      };
      this.interlocutorLabel = { action, interlocutor: 'intervenant(e)' };
      this.trainerModal = true;
    },
    openCompanyRepresentativeModal (action) {
      this.tempInterlocutor = {
        _id: this.course.companyRepresentative._id,
        isContact: !!this.course.companyRepresentative._id &&
        this.course.companyRepresentative._id === this.course.contact._id,
      };
      this.interlocutorLabel = { action, interlocutor: 'Référent structure' };
      this.companyRepresentativeModal = true;
    },
    openContactAdditionModal () {
      this.tempContactId = this.course.contact._id;
      this.contactAdditionModal = true;
    },
    copy () {
      copyToClipboard(this.traineesEmails)
        .then(() => NotifyPositive('Adresses mail copiées !'))
        .catch(() => NotifyNegative('Erreur lors de la copie des emails.'));
    },
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
