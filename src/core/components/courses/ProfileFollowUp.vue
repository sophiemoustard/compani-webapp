<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Contact pour la formation</p>
      <div class="row gutter-profile">
        <ni-input caption="Prénom Nom" v-model.trim="course.contact.name" @focus="saveTmp('contact.name')"
          @blur="updateCourse('contact.name')" :error="$v.course.contact.name.$error" />
        <ni-input caption="Téléphone" @blur="updateCourse('contact.phone')"
          @focus="saveTmp('contact.phone')" v-model.trim="course.contact.phone"
          :error="$v.course.contact.phone.$error" :error-message="phoneNbrErrorcontact" />
        <ni-input caption="Email" v-model.trim="course.contact.email"
          @focus="saveTmp('contact.email')" @blur="updateCourse('contact.email')"
          :error="$v.course.contact.email.$error" :error-message="emailErrorcontact" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Actions utiles</p>
      <ni-banner v-if="disabledFollowUp">
        <template v-slot:message>
          Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
          pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
        </template>
      </ni-banner>
      <ni-banner v-if="!get(this.course, 'subProgram.program.learningGoals')">
        <template v-slot:message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger
          les attestations de fin de formation.
        </template>
      </ni-banner>

      <ni-course-info-link :disable-link="disabledFollowUp" />

      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense
            type="a" :href="!disabledFollowUp && downloadAttendanceSheet()" target="_blank" />
        </q-item-section>
        <q-item-section>Télécharger les feuilles d'émargement</q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disableDownloadCompletionCertificates" icon="file_download"
            flat dense type="a" target="_blank"
            :href="!disableDownloadCompletionCertificates && downloadCompletionCertificates()" />
        </q-item-section>
        <q-item-section>Télécharger les attestations de fin de formation</q-item-section>
      </q-item>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Envoi de SMS</p>
      <p>Historique d'envoi </p>
      <ni-simple-table :data="smsSent" :columns="smsSentColumns" :pagination.sync="pagination" class="q-mb-md"
        :loading="smsLoading">
        <template v-slot:body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round small color="grey" icon="remove_red_eye"
                    @click.native="openSmsHistoriesModal(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <ni-banner v-if="isFinished">
        <template v-slot:message>
          Impossible d'envoyer un sms pour une formation qui est finie.
        </template>
      </ni-banner>
      <ni-banner v-if="missingTraineesPhone.length" icon="info_outline">
        <template v-slot:message>
          Il manque le numéro de téléphone de {{ formatQuantity('stagiaire', missingTraineesPhone.length) }} sur
          {{ course.trainees.length }} : {{ missingTraineesPhone.join(', ') }}.
        </template>
      </ni-banner>
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp || isFinished" icon="mdi-cellphone-message" flat
            dense @click="openSmsModal" />
        </q-item-section>
        <q-item-section>Envoyer un SMS de convocation ou de rappel aux stagiaires</q-item-section>
      </q-item>
    </div>

    <!-- Modal envoi message -->
    <message-sending-modal v-model="smsModal" :filtered-message-type-options="filteredMessageTypeOptions"
      :new-sms="newSms" @send="sendMessage" @updateType="updateMessage" :loading="loading" @hide="resetSmsModal" />

    <!-- Modal visualisation message -->
    <message-details-modal v-model="smsHistoriesModal" :missing-trainees-phone-history="missingTraineesPhoneHistory"
      :message-type-options="messageTypeOptions" :sms-history="smsHistory" @hide="resetSmsHistoryModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import Courses from '@api/Courses';
import { formatQuantity, formatIdentity } from '@helpers/utils';
import Input from '@components/form/Input';
import SmsSendingModal from '@components/courses/SmsSendingModal';
import SmsDetailsModal from '@components/courses/SmsDetailsModal';
import Banner from '@components/Banner';
import SimpleTable from '@components/table/SimpleTable';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { CONVOCATION, REMINDER, REQUIRED_LABEL } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { courseMixin } from '@mixins/courseMixin';
import CourseInfoLink from '@components/courses/CourseInfoLink';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'message-sending-modal': SmsSendingModal,
    'message-details-modal': SmsDetailsModal,
    'ni-simple-table': SimpleTable,
    'ni-banner': Banner,
    'ni-course-info-link': CourseInfoLink,
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
      newSms: { body: '', type: '' },
      loading: false,
      courseLoading: false,
      smsSent: [],
      smsSentColumns: [
        { name: 'type', label: 'Type', align: 'left', field: 'type', format: this.getType },
        {
          name: 'date',
          label: 'Date d\'envoi',
          align: 'left',
          field: 'date',
          format: value => this.$moment(value).format('DD/MM/YYYY'),
        },
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
    };
  },
  async created () {
    await Promise.all([this.refreshCourse(), this.refreshSms()]);
    this.setDefaultMessageType();
  },
  validations () {
    return {
      course: {
        contact: {
          name: { required },
          phone: { required, frPhoneNumber },
          email: { email },
        },
      },
    };
  },
  computed: {
    ...mapState('course', ['course']),
    disableDownloadCompletionCertificates () {
      return this.disabledFollowUp || !get(this.course, 'subProgram.program.learningGoals');
    },
    isFinished () {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate));
      return !slots.length && !this.course.slotsToPlan.length;
    },
    courseNotStartedYet () {
      const slots = this.course.slots.filter(slot => this.$moment().isAfter(slot.endDate));
      return !slots.length;
    },
    courseLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/`
        + `trainees/courses/${this.course._id}`;
    },
    emailErrorcontact () {
      if (!this.$v.course.contact.email.email) return 'Email non valide';
      return '';
    },
    phoneNbrErrorcontact () {
      if (this.$v.course.contact.phone.required === false) return REQUIRED_LABEL;
      if (!this.$v.course.contact.phone.frPhoneNumber) return 'Numéro de téléphone non valide';
      return '';
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
        this.smsSent = smsSent.sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des sms');
        this.smsSent = [];
      } finally {
        this.smsLoading = false;
      }
    },
    openSmsModal () {
      this.updateMessage(this.newSms.type);
      this.smsModal = true;
    },
    resetSmsModal () {
      this.updateMessage(this.newSms.type);
      this.smsModal = false;
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
    openSmsHistoriesModal (smsId) {
      this.smsHistoriesModal = true;
      this.smsHistory = this.smsSent.find(sms => sms._id === smsId);
    },
    resetSmsHistoryModal () {
      this.smsHistoriesModal = false;
      this.smsHistory = { missingPhones: [] };
    },
    updateMessage (newMessageType) {
      if (newMessageType === CONVOCATION) this.setConvocationMessage();
      else if (newMessageType === REMINDER) this.setReminderMessage();
    },
    setConvocationMessage () {
      const slots = this.course.slots.sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.newSms.body = `Bonjour,\nVous êtes inscrit(e) à la formation ${this.courseName}.\n`
      + `La première session a lieu le ${date} à partir de ${hour}.\nMerci de vous `
      + 'présenter au moins 15 minutes avant le début de la formation.\nToutes les informations sur : '
      + `${this.courseLink}\nNous vous souhaitons une bonne formation,\nCompani`;
    },
    setReminderMessage () {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate))
        .sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.newSms.body = `Bonjour,\nRAPPEL : vous êtes inscrit(e) à la formation ${this.courseName}.\n`
      + `Votre prochaine session a lieu le ${date} à partir de ${hour}.\nMerci de vous `
      + 'présenter au moins 15 minutes avant le début de la formation.\nToutes les informations sur : '
      + `${this.courseLink}\nNous vous souhaitons une bonne formation,\nCompani`;
    },
    async sendMessage (sendingSms) {
      try {
        this.loading = true;
        await Courses.sendSMS(this.course._id, sendingSms);
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
    downloadAttendanceSheet () {
      return Courses.downloadAttendanceSheet(this.course._id);
    },
    downloadCompletionCertificates () {
      return Courses.downloadCompletionCertificates(this.course._id);
    },
  },
};
</script>

<style lang="stylus" scoped>
.q-item
  padding-left: 0px
</style>
