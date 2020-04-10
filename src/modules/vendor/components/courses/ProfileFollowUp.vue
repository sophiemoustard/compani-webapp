<template>
  <div>
    <q-banner v-if="disabledFollowUp" class="full-width warning q-mb-md" dense>
      <q-icon size="sm" name="warning" />
      <div>
        Il manque la ou les information(s) suivante(s) pour assurer le suivi de la formation :
        {{ followUpMissingInfo.join(', ') }}.
      </div>
    </q-banner>
    <div class="course-link">
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="info" flat dense type="a"
            target="_blank" :href="courseInfoLink" />
        </q-item-section>
        <q-item-section class="course-link">Page info formation</q-item-section>
      </q-item>
      <div class="course-link-share" @click="copyToClipboard">
        <q-btn color="primary" size="xs" :disable="disabledFollowUp" icon="link" flat dense />
        <div class="course-link-share-label" :class="{ 'course-link-share-label-disabled': disabledFollowUp }"
          color="primary">
          Obtenir un lien de partage
        </div>
      </div>
    </div>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp || isFinished" icon="mdi-cellphone-message" flat
          dense @click="openSmsModal" />
      </q-item-section>
      <q-item-section>Envoyer un SMS de convocation ou de rappel aux stagiaires</q-item-section>
    </q-item>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense
          type="a" :href="downloadAttendanceSheet()" target="_blank" />
      </q-item-section>
      <q-item-section>Télécharger les feuilles d'émargement</q-item-section>
    </q-item>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense />
      </q-item-section>
      <q-item-section>Télécharger les attestations de fin de formation</q-item-section>
    </q-item>

    <!-- Modal envoi message -->
    <ni-modal v-model="smsModal">
      <template slot="title">
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="messageTypeOptions" v-model="messageType" required-field
        @input="updateMessage" />
      <ni-input in-modal caption="Message" v-model="message" type="textarea" :rows="7" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary"
          :loading="loading" @click="sendMessage" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Courses from '@api/Courses';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  props: {
    profileId: { type: String },
  },
  data () {
    return {
      smsModal: false,
      messageType: 'convocation',
      messageTypeOptions: [
        { label: 'SMS de convocation', value: 'convocation' },
        { label: 'SMS de rappel', value: 'reminder' },
      ],
      message: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
    disabledFollowUp () {
      return this.followUpMissingInfo.length > 0;
    },
    followUpMissingInfo () {
      const missingInfo = [];
      if (!this.course.trainer) missingInfo.push('le formateur');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('le ou les stagiaire(s)');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('le ou les créneau(x)');

      return missingInfo;
    },
    isFinished () {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate))
      return !slots.length;
    },
    courseInfoLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/` +
        `trainees/courses/${this.course._id}`;
    },
  },
  methods: {
    copyToClipboard () {
      const el = document.createElement('textarea');
      el.value = this.courseInfoLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      NotifyPositive('Lien copié !');
    },
    openSmsModal () {
      this.updateMessage();
      this.smsModal = true;
    },
    updateMessage () {
      const courseLink = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/trainees/courses/${this.course._id}`;
      if (this.messageType === 'convocation') {
        this.setConvocationMessage(courseLink);
      } else if (this.messageType === 'reminder') {
        this.setReminderMessage(courseLink);
      };
    },
    setConvocationMessage (courseLink) {
      const slots = this.course.slots.sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.message = `Bonjour,\nVous êtes inscrits à la formation ${this.course.name}.\nLa première session à ` +
        `lieu le ${date} à partir de ${hour}.\nMerci de vous présenter au moins 15 minutes avant le début de la ` +
        `formation.\nToutes les informations sur : ${courseLink}\nNous vous souhaitons une bonne formation,\nCompani`;
    },
    setReminderMessage (courseLink) {
      const slots = this.course.slots.filter(slot => this.$moment().isBefore(slot.startDate))
        .sort((a, b) => a.startDate - b.startDate);
      const date = this.$moment(slots[0].startDate).format('DD/MM/YYYY');
      const hour = this.$moment(slots[0].startDate).format('HH:mm');

      this.message = `Bonjour,\nRAPPEL : vous êtes inscrits à la formation ${this.course.name}.\nVotre ` +
      `prochaine session à lieu le ${date} à partir de ${hour}.\nMerci de vous présenter au moins 15 minutes avant ` +
      `le début de la formation.\nToutes les informations sur : ${courseLink}\nNous vous souhaitons une bonne ` +
      'formation,\nCompani'
    },
    async sendMessage () {
      try {
        this.loading = true;
        await Courses.sendSMS(this.course._id, { body: this.message });
        return NotifyPositive('SMS bien envoyé(s).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi des SMS');
      } finally {
        this.smsModal = false;
        this.loading = false;
        this.message = '';
        this.messageType = 'convocation';
      }
    },
    downloadAttendanceSheet () {
      return Courses.downloadAttendanceSheet(this.course._id);
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
</style>
