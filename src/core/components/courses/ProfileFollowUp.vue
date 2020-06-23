<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Contact pour la formation</p>
      <div class="row gutter-profile">
        <ni-input caption="Prénom Nom" v-model.trim="course.contact.name" @focus="saveTmp('contact.name')"
          @blur="updateCourse('contact.name')" :error="$v.course.contact.name.$error"/>
        <ni-input caption="Téléphone" @blur="updateCourse('contact.phone')"
            @focus="saveTmp('contact.phone')" v-model.trim="course.contact.phone"
            :error="$v.course.contact.phone.$error" :error-label="phoneNbrErrorcontact" />
        <ni-input caption="Email" v-model.trim="course.contact.email"
            @focus="saveTmp('contact.email')" @blur="updateCourse('contact.email')"
            :error="$v.course.contact.email.$error" :error-label="emailErrorcontact" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Actions utiles</p>
      <ni-banner v-if="disabledFollowUp">
        <template v-slot:message>
          Il manque la ou les information(s) suivante(s) pour assurer le suivi de la formation :
          {{ followUpMissingInfo.join(', ') }}.
        </template>
      </ni-banner>
      <ni-banner v-if="!get(this.course, 'program.learningGoals')">
        <template v-slot:message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger les attestations de fin de formation.
        </template>
      </ni-banner>
      <div class="course-link">
        <q-item>
          <q-item-section side>
            <q-btn :disable="disabledFollowUp" color="primary" size="sm" icon="info" flat dense type="a"
              target="_blank" :href="!disabledFollowUp && courseLink" />
          </q-item-section>
          <q-item-section class="course-link">Page info formation</q-item-section>
        </q-item>
        <div class="course-link-share" v-clipboard:copy="!disabledFollowUp && courseLink"
          v-clipboard:success="handleCopySuccess">
          <q-btn color="primary" size="xs" :disable="disabledFollowUp" icon="link" flat dense />
          <div class="course-link-share-label" :class="{ 'course-link-share-label-disabled': disabledFollowUp }"
            color="primary">
            Obtenir un lien de partage
          </div>
        </div>
      </div>
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
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp || isFinished" icon="mdi-cellphone-message" flat
            dense @click="openSmsModal" />
        </q-item-section>
        <q-item-section>Envoyer un SMS de convocation ou de rappel aux stagiaires</q-item-section>
      </q-item>
    </div>

    <!-- Modal envoi message -->
    <ni-modal v-model="smsModal">
      <template slot="title">
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="filteredMessageTypeOptions" v-model="messageType" required-field
        @input="updateMessage" />
      <ni-input in-modal caption="Message" v-model="message" type="textarea" :rows="7" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary"
          :loading="loading" @click="sendMessage" />
      </template>
    </ni-modal>

    <!-- Modal visualisation message -->
    <ni-modal v-model="smsHistoriesModal" @hide="resetSmsHistoryModal">
      <template slot="title">
        Message envoyé le <span class="text-weight-bold">{{$moment(smsHistory.date).format('DD/MM/YYYY')}}</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="messageTypeOptions" v-model="smsHistory.type" disable />
      <ni-input in-modal caption="Message" v-model="smsHistory.message" type="textarea" :rows="7" disable />
    </ni-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import Courses from '@api/Courses';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import Banner from '@components/Banner';
import SimpleTable from '@components/table/SimpleTable';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { CONVOCATION, REMINDER, REQUIRED_LABEL } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal.js';
import { formatIdentity } from '@helpers/utils.js';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-simple-table': SimpleTable,
    'ni-banner': Banner,
  },
  mixins: [courseMixin],
  props: {
    profileId: { type: String },
  },
  data () {
    return {
      smsModal: false,
      messageType: '',
      messageTypeOptions: [
        { label: 'Convocation', value: CONVOCATION },
        { label: 'Rappel', value: REMINDER },
      ],
      message: '',
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
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'sender',
          label: 'Expéditeur',
          align: 'left',
          field: row => get(row, 'sender.identity') || '',
          format: (value) => formatIdentity(value, 'FL'),
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      pagination: { rowsPerPage: 0 },
      smsLoading: false,
      smsHistoriesModal: false,
      smsHistory: {},
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
    disabledFollowUp () {
      return this.followUpMissingInfo.length > 0;
    },
    disableDownloadCompletionCertificates () {
      return this.disabledFollowUp || !get(this.course, 'program.learningGoals');
    },
    followUpMissingInfo () {
      const missingInfo = [];
      if (!this.course.trainer) missingInfo.push('l\'intervenant');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('le ou les stagiaire(s)');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('le ou les créneau(x)');
      if (!get(this.course, 'contact.name')) missingInfo.push('le nom du contact pour la formation');
      if (!get(this.course, 'contact.phone')) missingInfo.push('le numéro du contact pour la formation');

      return missingInfo;
    },
    isFinished () {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate))
      return !slots.length;
    },
    courseNotStartedYet () {
      const slots = this.course.slots.filter(slot => this.$moment().isAfter(slot.endDate))
      return !slots.length;
    },
    courseLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/` +
        `trainees/courses/${this.course._id}`;
    },
    emailErrorcontact () {
      if (!this.$v.course.contact.email.email) return 'Email non valide';
      return '';
    },
    phoneNbrErrorcontact () {
      if (this.$v.course.contact.phone.required === false) return REQUIRED_LABEL;
      else if (!this.$v.course.contact.phone.frPhoneNumber) return 'Numéro de téléphone non valide';
      return '';
    },
    filteredMessageTypeOptions () {
      return this.courseNotStartedYet
        ? this.messageTypeOptions
        : this.messageTypeOptions.filter(t => t.value === REMINDER);
    },
  },
  methods: {
    get,
    getType (value) {
      const type = this.messageTypeOptions.find(type => type.value === value);
      return type ? type.label : '';
    },
    setDefaultMessageType () {
      this.messageType = this.courseNotStartedYet ? CONVOCATION : REMINDER;
    },
    async refreshSms () {
      try {
        this.smsLoading = true;
        const smsSent = await Courses.getSMSHistory(this.course._id);
        this.smsSent = smsSent.sort((a, b) => new Date(b.date) - new Date(a.date))
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des sms');
        this.smsSent = [];
      } finally {
        this.smsLoading = false;
      }
    },
    handleCopySuccess () {
      return NotifyPositive('Lien copié !');
    },
    openSmsModal () {
      this.updateMessage();
      this.smsModal = true;
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
      this.smsHistory = {};
    },
    updateMessage () {
      if (this.messageType === CONVOCATION) this.setConvocationMessage();
      else if (this.messageType === REMINDER) this.setReminderMessage();
    },
    setConvocationMessage () {
      const slots = this.course.slots.sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.message = `Bonjour,\nVous êtes inscrit(e) à la formation ${this.course.name}.\nLa première session à ` +
        `lieu le ${date} à partir de ${hour}.\nMerci de vous présenter au moins 15 minutes avant le début de la ` +
        `formation.\nToutes les informations sur : ${this.courseLink}\nNous vous souhaitons une bonne formation,` +
        '\nCompani';
    },
    setReminderMessage () {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate))
        .sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.message = `Bonjour,\nRAPPEL : vous êtes inscrit(e) à la formation ${this.course.name}.\nVotre ` +
      `prochaine session à lieu le ${date} à partir de ${hour}.\nMerci de vous présenter au moins 15 minutes avant ` +
      `le début de la formation.\nToutes les informations sur : ${this.courseLink}\nNous vous souhaitons une bonne ` +
      'formation,\nCompani'
    },
    async sendMessage () {
      try {
        this.loading = true;
        await Courses.sendSMS(this.course._id, { body: this.message, type: this.messageType });
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
}
</script>

<style lang="stylus" scoped>
.course-link
  @media screen and (min-width: 1025px)
    display: flex
    flex-direction: row
    align-items: center
    justify-content: left
  &-share
    display: flex
    flex-direction: row
    align-items: center
    @media screen and (max-width: 1024px)
      padding: 0 0 10px 55px
    &-label
      cursor: pointer
      color: $primary
      text-decoration underline
      font-size: 14px
      @media screen and (max-width: 767px)
        font-size: 12px
      &-disabled
        opacity: 0.7 !important;
        cursor: not-allowed !important
.q-item
  padding-left: 0px;
</style>
