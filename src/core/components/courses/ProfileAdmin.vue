<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Contact pour la formation</p>
      <p class="text-italic">Contact donné aux stagiaires s'ils ont des questions pratiques concernant la formation</p>
      <div class="row gutter-profile">
        <ni-select v-model.trim="course.contact._id" @blur="updateCourse('contact')" :options="contactOptions"
          @focus="saveTmp('contact')" :error="isMissingContactPhone" :disable="isArchived"
          error-message="numéro de téléphone manquant, veuillez le renseigner" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Actions utiles</p>
      <ni-banner v-if="followUpDisabled">
        <template #message>
          Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
          pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
        </template>
      </ni-banner>
      <ni-banner v-if="!get(this.course, 'subProgram.program.learningGoals')">
        <template #message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger
          les attestations de fin de formation.
        </template>
      </ni-banner>
      <ni-course-info-link :disable-link="disableDocDownload" @download="downloadConvocation" />
      <ni-bi-color-button icon="file_download" label="Feuilles d'émargement"
        :disable="disableDocDownload" @click="downloadAttendanceSheet" size="16px" />
      <ni-bi-color-button icon="file_download" label="Attestations de fin de formation"
        :disable="disableDownloadCompletionCertificates" @click="downloadCompletionCertificates" size="16px" />
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Envoi de SMS</p>
      <p>Historique d'envoi </p>
      <ni-responsive-table :data="smsSent" :columns="smsSentColumns" :pagination.sync="pagination" class="q-mb-md"
        :loading="smsLoading">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <ni-button icon="remove_red_eye" @click.native="openSmsHistoriesModal(col.value)" />
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

    <!-- Modal envoi message -->
    <sms-sending-modal v-model="smsModal" :filtered-message-type-options="filteredMessageTypeOptions" :loading="loading"
      :new-sms.sync="newSms" @send="sendMessage" @update-type="updateMessage" @hide="resetSmsModal" />

    <!-- Modal visualisation message -->
    <sms-details-modal v-model="smsHistoriesModal" :missing-trainees-phone-history="missingTraineesPhoneHistory"
      :message-type-options="messageTypeOptions" :sms-history="smsHistory" @hide="resetSmsHistoryModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import Courses from '@api/Courses';
import Users from '@api/Users';
import SmsSendingModal from '@components/courses/SmsSendingModal';
import SmsDetailsModal from '@components/courses/SmsDetailsModal';
import Banner from '@components/Banner';
import Button from '@components/Button';
import Select from '@components/form/Select';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import CourseInfoLink from '@components/courses/CourseInfoLink';
import BiColorButton from '@components/BiColorButton';
import {
  CONVOCATION,
  REMINDER,
  COACH,
  CLIENT_ADMIN,
  TRAINER,
  TRAINING_ORGANISATION_MANAGER,
  VENDOR_ADMIN,
  INTRA,
} from '@data/constants';
import {
  formatQuantity,
  formatIdentity,
  readAPIResponseWithTypeArrayBuffer,
  formatAndSortIdentityOptions,
} from '@helpers/utils';
import { formatDate, descendingSort, ascendingSort } from '@helpers/date';
import { downloadFile, downloadZip } from '@helpers/file';
import moment from '@helpers/moment';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileAdmin',
  components: {
    'ni-button': Button,
    'sms-sending-modal': SmsSendingModal,
    'sms-details-modal': SmsDetailsModal,
    'ni-responsive-table': ResponsiveTable,
    'ni-banner': Banner,
    'ni-course-info-link': CourseInfoLink,
    'ni-bi-color-button': BiColorButton,
    'ni-select': Select,
  },
  mixins: [courseMixin],
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      smsModal: false,
      messageTypeOptions: [
        { label: 'Convocation', value: CONVOCATION },
        { label: 'Rappel', value: REMINDER },
      ],
      newSms: { content: '', type: '' },
      loading: false,
      courseLoading: false,
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
    };
  },
  async created () {
    await Promise.all([this.refreshCourse(), this.refreshSms(), this.refreshContacts()]);
    this.setDefaultMessageType();
  },
  validations () {
    return {
      course: { contact: { contact: { phone: { required } } } },
      newSms: { content: { required }, type: { required } },
    };
  },
  watch: {
    course () {
      const phoneValidation = get(this.$v, 'course.contact.contact.phone', '');
      if (phoneValidation) phoneValidation.$touch();
    },
  },
  computed: {
    ...mapState('course', ['course']),
    disableDownloadCompletionCertificates () {
      return this.disableDocDownload || !get(this.course, 'subProgram.program.learningGoals');
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
      return !!get(this.course, 'contact._id') && get(this.$v, 'course.contact.contact.phone.$error');
    },
  },
  methods: {
    get,
    formatQuantity,
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
    async refreshCourse () {
      try {
        this.courseLoading = true;
        await this.$store.dispatch('course/fetchCourse', { courseId: this.profileId });
      } catch (e) {
        console.error(e);
      } finally {
        this.courseLoading = false;
      }
    },
    async refreshContacts () {
      try {
        const vendorUsers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });

        let clientUsersFromCompany = [];
        if (this.course.type === INTRA) {
          clientUsersFromCompany = await Users.list({ role: [COACH, CLIENT_ADMIN], company: this.course.company._id });
        }

        this.contactOptions = Object.freeze(formatAndSortIdentityOptions([...vendorUsers, ...clientUsersFromCompany]));
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
        this.$v.newSms.$touch();
        if (this.$v.newSms.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await Courses.sendSMS(this.course._id, this.newSms);
        await this.refreshSms();
        return NotifyPositive('SMS bien envoyé(s).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi des SMS');
      } finally {
        this.smsModal = false;
        this.loading = false;
        this.message = '';
        this.setDefaultMessageType();
      }
    },
    async downloadAttendanceSheet () {
      if (this.disableDocDownload) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadAttendanceSheet(this.course._id);
        downloadFile(pdf, 'emargement.pdf');
      } catch (e) {
        console.error(e);
        if (e.status === 404) {
          const { message } = readAPIResponseWithTypeArrayBuffer(e);
          return NotifyNegative(message);
        }
        NotifyNegative('Erreur lors du téléchargement de la feuille d\'émargement.');
      } finally {
        this.pdfLoading = false;
      }
    },
    async downloadCompletionCertificates () {
      if (this.disableDownloadCompletionCertificates) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadCompletionCertificates(this.course._id);
        downloadZip(pdf, 'attestations.zip');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement des attestations.');
      } finally {
        this.pdfLoading = false;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.q-item
  padding-left: 0px
</style>
