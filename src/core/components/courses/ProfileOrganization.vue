<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div v-if="isClientInterface && isCourseInter" class="q-mb-lg">
        <p class="text-weight-bold">Informations pratiques</p>
        <ni-banner v-if="followUpDisabled">
          <template #message>{{ missingInfoMsg }}</template>
        </ni-banner>
        <ni-course-info-link :disable-link="disableDocDownload" @download="downloadConvocation" />
      </div>
      <div v-else class="profile-container">
        <ni-bi-color-button class="button-history" icon="history" label="Historique" @click="toggleHistory" />
        <div class="row gutter-profile">
          <ni-input caption="Informations complémentaires" v-model.trim="course.misc"
            @blur="updateCourse('misc')" @focus="saveTmp('misc')" :disable="isArchived" />
        </div>
        <p class="text-weight-bold table-title">Interlocuteurs</p>
        <div class="interlocutor-container">
          <interlocutor-cell :interlocutor="course.salesRepresentative" caption="Référent Compani"
            :open-edition-modal="openSalesRepresentativeModal" :disable="isArchived" />
          <interlocutor-cell v-if="!!course.trainer._id" :interlocutor="course.trainer" caption="Intervenant(e)"
            :open-edition-modal="() => openTrainerModal('Modifier l\'')" :disable="isArchived" />
          <ni-button v-else-if="canUpdateTrainer" color="primary" icon="add" class="add-trainer"
            label="Ajouter un(e) intervenant(e)" :disable="interlocutorModalLoading || isArchived"
            @click="() => openTrainerModal('Ajouter un(e)')" />
        </div>
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
      <div class="q-mb-lg">
        <p class="text-italic">
          Contact donné aux stagiaires s'ils ont des questions pratiques concernant la formation
        </p>
        <div class="row gutter-profile">
          <ni-select v-model.trim="course.contact._id" @blur="updateCourse('contact')" :options="contactOptions"
            @focus="saveTmp('contact')" :error="isMissingContactPhone" :disable="isArchived || !isVendorInterface"
            clearable error-message="Numéro de téléphone manquant, veuillez le renseigner" />
        </div>
      </div>
      <div class="q-mb-xl">
        <ni-banner v-if="followUpDisabled">
          <template #message>
            Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
            pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
          </template>
        </ni-banner>
        <ni-course-info-link :disable-link="disableDocDownload" @download="downloadConvocation" />
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Envoi de SMS</p>
        <p>Historique d'envoi </p>
        <ni-responsive-table :data="smsSent" :columns="smsSentColumns" v-model:pagination="pagination" class="q-mb-md"
          :loading="smsLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="remove_red_eye" @click="openSmsHistoriesModal(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <ni-banner v-if="missingTraineesPhone.length" icon="info_outline">
          <template #message>
            Il manque le numéro de téléphone de {{ formatQuantity('stagiaire', missingTraineesPhone.length) }} sur
            {{ course.trainees.length }} : {{ missingTraineesPhone.join(', ') }}.
          </template>
        </ni-banner>
        <ni-bi-color-button icon="mdi-cellphone-message" :disable="disableSms" @click="openSmsModal"
          label="Envoyer un SMS de convocation ou de rappel aux stagiaires" size="16px" />
      </div>
    </div>

    <sms-sending-modal v-model="smsModal" :filtered-message-type-options="filteredMessageTypeOptions" :loading="loading"
      v-model:new-sms="newSms" @send="sendMessage" @update-type="updateMessage" @hide="resetSmsModal" />

    <sms-details-modal v-model="smsHistoriesModal" :missing-trainees-phone-history="missingTraineesPhoneHistory"
      :message-type-options="messageTypeOptions" :sms-history="smsHistory" @hide="resetSmsHistoryModal" />

    <interlocutor-modal v-model="salesRepresentativeEditionModal" v-model:interlocutor="tempInterlocutorId"
      @submit="updateSalesRepresentative" :validations="v$.tempInterlocutorId" :loading="interlocutorModalLoading"
      @hide="resetSalesRepresentativeEdition" :label="salesRepresentativeLabel"
      :interlocutors-options="salesRepresentativeOptions" />

    <interlocutor-modal v-model="trainerModal" v-model:interlocutor="tempInterlocutorId" @submit="updateTrainer"
      :validations="v$.tempInterlocutorId" :loading="interlocutorModalLoading" @hide="resetTrainer"
      :label="trainerLabel" :interlocutors-options="trainerOptions" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import uniqBy from 'lodash/uniqBy';
import cloneDeep from 'lodash/cloneDeep';
import Users from '@api/Users';
import CourseHistories from '@api/CourseHistories';
import Roles from '@api/Roles';
import Courses from '@api/Courses';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import SlotContainer from '@components/courses/SlotContainer';
import TraineeTable from '@components/courses/TraineeTable';
import CourseInfoLink from '@components/courses/CourseInfoLink';
import CourseHistoryFeed from '@components/courses/CourseHistoryFeed';
import SmsSendingModal from '@components/courses/SmsSendingModal';
import SmsDetailsModal from '@components/courses/SmsDetailsModal';
import InterlocutorCell from '@components/courses/InterlocutorCell';
import InterlocutorModal from '@components/courses/InterlocutorModal';
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
import { formatAndSortIdentityOptions, formatQuantity, formatIdentity } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';
import { formatDate, descendingSort, ascendingSort } from '@helpers/date';
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
    'ni-select': Select,
    'ni-slot-container': SlotContainer,
    'ni-trainee-table': TraineeTable,
    'ni-course-info-link': CourseInfoLink,
    'ni-banner': Banner,
    'course-history-feed': CourseHistoryFeed,
    'ni-bi-color-button': BiColorButton,
    'sms-sending-modal': SmsSendingModal,
    'sms-details-modal': SmsDetailsModal,
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'interlocutor-cell': InterlocutorCell,
    'interlocutor-modal': InterlocutorModal,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      trainerOptions: [],
      salesRepresentativeOptions: [],
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
      smsSent: [],
      smsSentColumns: [
        { name: 'type', label: 'Type', align: 'left', field: 'type', format: this.getType },
        { name: 'date', label: 'Date d\'envoi', align: 'left', field: 'date', format: formatDate },
        {
          name: 'sender',
          label: 'Expéditeur',
          align: 'left',
          field: row => get(row, 'sender.identity') || '',
          format: value => formatIdentity(value, 'FL'),
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      pagination: { rowsPerPage: 0 },
      smsLoading: false,
      smsHistoriesModal: false,
      smsHistory: { missingPhones: [] },
      urlAndroid: 'https://bit.ly/3en5OkF',
      urlIos: 'https://apple.co/33kKzcU',
      contactOptions: [],
      tempInterlocutorId: '',
      salesRepresentativeLabel: { action: 'Modifier le ', interlocutor: 'Référent Compani' },
      salesRepresentativeEditionModal: false,
      interlocutorModalLoading: false,
      trainerLabel: { action: '', interlocutor: '' },
      trainerModal: false,
    };
  },
  validations () {
    return {
      tempInterlocutorId: { required },
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
    missingTraineesPhoneHistory () {
      if (!this.smsHistory.missingPhones.length) return [];

      return this.smsHistory.missingPhones.map(mp => formatIdentity(mp.identity, 'FL'));
    },
    courseName () {
      return this.composeCourseName(this.course);
    },
    allFuturSlotsAreNotPlanned () {
      const futurSlots = this.course.slots.filter(s => s.startDate).filter(s => moment().isBefore(s.startDate));
      return !!this.course.slotsToPlan.length && !futurSlots.length;
    },
    disableSms () {
      const noPhoneNumber = this.missingTraineesPhone.length === this.course.trainees.length;

      return this.followUpDisabled || noPhoneNumber;
    },
    isMissingContactPhone () {
      return !!get(this.course, 'contact._id') && get(this.v$, 'course.contact.contact.phone.$error');
    },
    canUpdateTrainer () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role']));

      return ability.can('update', 'interlocutor');
    },
  },
  async created () {
    const promises = [this.refreshCourse()];
    if (this.isVendorInterface || this.isIntraCourse) promises.push(this.refreshSms(), this.refreshContacts());
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
        const smsSent = await Courses.getSMSHistory(this.course._id);
        this.smsSent = smsSent.sort((a, b) => descendingSort(a.date, b.date));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des sms');
        this.smsSent = [];
      } finally {
        this.smsLoading = false;
      }
    },
    openSmsModal () {
      if (this.allFuturSlotsAreNotPlanned) {
        return NotifyWarning('Vous ne pouvez pas envoyer des sms pour une formation sans créneaux à venir.');
      }
      if (this.isFinished) return NotifyWarning('Vous ne pouvez pas envoyer des sms pour une formation terminée.');

      this.updateMessage(this.newSms.type);
      this.smsModal = true;
    },
    resetSmsModal () {
      this.updateMessage(this.newSms.type);
    },
    async refreshContacts () {
      try {
        if (this.isVendorInterface) {
          const vendorUsers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });

          const clientUsersFromCompany = this.course.type === INTRA
            ? await Users.list({ role: [COACH, CLIENT_ADMIN], company: this.course.company._id })
            : [];

          const contacts = uniqBy([...clientUsersFromCompany, ...vendorUsers], '_id');
          this.contactOptions = Object.freeze(formatAndSortIdentityOptions(contacts));
        } else {
          this.contactOptions = Object.freeze(formatAndSortIdentityOptions([this.course.contact]));
        }
      } catch (e) {
        console.error(e);
      }
    },
    openSmsHistoriesModal (smsId) {
      this.smsHistoriesModal = true;
      this.smsHistory = this.smsSent.find(sms => sms._id === smsId);
    },
    resetSmsHistoryModal () {
      this.smsHistory = { missingPhones: [] };
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
        downloadFile(pdf, 'convocation.pdf', 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la convocation.');
      } finally {
        this.pdfLoading = false;
      }
    },
    async updateSalesRepresentative () {
      try {
        this.interlocutorModalLoading = true;
        this.v$.tempInterlocutorId.$touch();
        if (this.v$.tempInterlocutorId.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.update(this.profileId, { salesRepresentative: this.tempInterlocutorId });
        this.salesRepresentativeEditionModal = false;
        await this.refreshCourse();
        NotifyPositive('Référent Compani mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition du référent Compani.');
      } finally {
        this.interlocutorModalLoading = false;
      }
    },
    async updateTrainer () {
      try {
        this.interlocutorModalLoading = true;
        this.v$.tempInterlocutorId.$touch();
        if (this.v$.tempInterlocutorId.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.update(this.profileId, { trainer: this.tempInterlocutorId });
        this.trainerModal = false;
        await this.refreshCourse();
        NotifyPositive('Intervenant(e) mis à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'intervenant(e).');
      } finally {
        this.interlocutorModalLoading = false;
      }
    },
    resetSalesRepresentativeEdition () {
      this.tempInterlocutorId = '';
      this.v$.tempInterlocutorId.$reset();
    },
    openSalesRepresentativeModal () {
      this.tempInterlocutorId = this.course.salesRepresentative._id;
      this.salesRepresentativeEditionModal = true;
    },
    resetTrainer () {
      this.tempInterlocutorId = '';
      this.trainerLabel = { action: '', interlocutor: '' };
      this.v$.tempInterlocutorId.$reset();
    },
    openTrainerModal (action) {
      this.tempInterlocutorId = this.course.trainer._id;
      this.trainerLabel = { action, interlocutor: 'intervenant(e)' };
      this.trainerModal = true;
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
.add-trainer
  justify-self: start
  align-self: end
</style>
