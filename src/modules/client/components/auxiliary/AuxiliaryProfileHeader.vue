<template>
  <div class="header">
    <div class="row q-mb-md">
      <div class="col-xs-8 flex-row items-center col-md-10">
        <ni-button v-if="isExternalUser" class="on-left" icon="arrow_back" @click="$router.go(-1)" />
        <span class="ellipsis page-title">{{ title }}</span>
        <ni-button :disable="isPlanningRouterDisable" icon="date_range" @click="goToPlanning" class="q-ml-sm" />
      </div>
      <div class="flex-row custom-justify-end col-xs-4 col-md-2">
        <img :src="hasPicture" alt="Img user" class="avatar">
      </div>
    </div>
    <div class="row profile-info">
      <div class="col-sm-6 col-xs-12 q-pl-lg">
        <div class="flex-row items-center q-ml-sm">
          <div :class="['dot', userActivity.active ? 'dot-active' : 'dot-error']" />
          <div :class="[userActivity.active ? 'text-green-600' : 'text-orange-700']">{{ userActivity.status }}</div>
        </div>
        <div class="flex-row items-center q-ml-sm">
          <q-icon name="restore" class="q-mr-md" size="1rem" />
          <div class="q-mr-md">Depuis le {{ userStartDate }} ({{ userRelativeStartDate }})</div>
        </div>
      </div>
      <div class="q-pl-lg col-sm-6 col-xs-12 flex-row q-mt-xs">
        <div class="relative-position">
          <q-icon size="36px" name="phone_iphone" color="copper-grey-300" />
          <q-icon v-if="!userProfile.isConfirmed" class="chip-icon" name="cancel" color="secondary" size="16px" />
          <q-icon v-if="userProfile.isConfirmed" class="chip-icon" name="check_circle" color="green-600" size="16px" />
        </div>
        <div>
          <div class="text-weight-bold">{{ isAccountConfirmed }}</div>
          <div class="send-message-link" @click="openSmsModal">Envoyer un SMS</div>
        </div>
      </div>
    </div>

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
          :loading="loading" @click.native="sendMessage" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import Authentication from '@api/Authentication';
import Sms from '@api/Sms';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { DEFAULT_AVATAR, HR_SMS } from '@data/constants';
import moment from '@helpers/moment';
import { formatDate, dateDiff, formatDateDiff } from '@helpers/date';

export default {
  name: 'AuxiliaryProfileHeader',
  components: {
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  props: {
    profileId: { type: String, required: true },
    title: { type: String, required: true },
  },
  data () {
    return {
      loading: false,
      smsModal: false,
      message: '',
      messageType: 'PM',
      messageSupport: 'sms',
      messageTypeOptions: [
        { label: 'Pièces manquantes', value: 'PM' },
        { label: 'Envoi lien d\'activation', value: 'LA' },
        { label: 'Autres', value: 'Autres' },
      ],
    };
  },
  computed: {
    ...mapState({
      loggedUser: state => state.main.loggedUser,
      userProfile: state => state.userProfile.userProfile,
    }),
    isPlanningRouterDisable () {
      return !this.userProfile.contracts || !this.userProfile.contracts.length;
    },
    companyName () {
      return get(this.loggedUser, 'company.name');
    },
    userActivity () {
      return {
        status: this.userProfile.isActive ? 'Profil Actif' : 'Profil Inactif',
        active: this.userProfile.isActive,
      };
    },
    userStartDate () {
      if (this.userProfile.createdAt) return formatDate(this.userProfile.createdAt);
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return formatDateDiff(dateDiff(new Date(), this.userProfile.createdAt));
      return '';
    },
    isExternalUser () {
      return this.userProfile._id !== this.loggedUser._id;
    },
    isAccountConfirmed () {
      if (this.userProfile.isConfirmed) return 'Accès WebApp activé';
      return 'Accès WebApp non activé';
    },
    hasPicture () {
      return get(this.userProfile, 'picture.link') || DEFAULT_AVATAR;
    },
  },
  methods: {
    async updateMessage () {
      if (this.messageType === 'PM') {
        this.message = `Bonjour ${this.userProfile.identity.firstname},\nIl manque encore des informations et `
        + 'documents importants pour compléter votre dossier.\nCliquez ici pour compléter votre profil: '
        + `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/auxiliaries/info`
        + '\nSi vous rencontrez des difficultés, n’hésitez pas à vous adresser à votre coach ou votre '
        + 'marraine/parrain.';
      } else if (this.messageType === 'LA') {
        if (!this.userProfile.passwordToken || moment().isAfter(this.userProfile.passwordToken.expiresIn)) {
          this.userProfile.passwordToken = await Authentication.createPasswordToken(
            this.userProfile._id,
            { email: this.userProfile.local.email }
          );
        }
        this.message = `${this.companyName}. Bienvenue ! :)\nPour pouvoir `
          + 'commencer votre enregistrement sur Compani avant votre intégration, '
          + 'créez votre mot de passe en suivant ce lien: '
          + `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`
          + `/reset-password/${this.userProfile.passwordToken.token} :-)\n`
          + 'Par la suite pour vous connecter suivez ce lien: '
          + `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}.`;
      } else this.message = '';
    },
    openSmsModal () {
      this.updateMessage();
      this.smsModal = true;
    },
    goToPlanning () {
      this.$router.push({ name: 'ni planning auxiliaries', params: { targetedAuxiliaryId: this.userProfile._id } });
    },
    async sendMessage () {
      this.loading = true;
      await this.sendSMS();

      this.loading = false;
      this.smsModal = false;
      this.message = '';
    },
    async sendSMS () {
      try {
        if (!this.companyName) {
          return NotifyNegative('Veuillez renseigner votre nom commercial dans la page de configuration.');
        }
        await Sms.send({
          recipient: `+33${this.userProfile.contact.phone.substring(1)}`,
          content: this.message,
          tag: HR_SMS,
        });
        NotifyPositive('SMS bien envoyé.');
      } catch (e) {
        console.error(e);
        this.loading = false;
        NotifyNegative('Erreur lors de l\'envoi du SMS.');
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.avatar
  width: 59px
  height: 59px
  border: 1px solid $copper-grey-400

.send-message-link
  color: $primary
  cursor: pointer
  &:hover
    text-decoration: underline

.chip-icon
  height: 14px
  position: absolute
  right: 5px
  top: -4px
  width: 14px
  border-radius: 50%
  background: white

.custom-justify-end
  justify-content: flex-end
  @media screen and (max-width: 767px)
    justify-content: center
</style>
