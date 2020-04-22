<template>
  <div class="header">
    <div class="row col-xs-12 q-mb-md">
      <div class="col-xs-8 row items-baseline col-md-10">
        <div class="row items-center">
          <q-icon v-if="isExternalUser" class="q-mr-md cursor-pointer" size="1rem" name="arrow_back" color="primary"
            @click.native="$router.go(-1)" />
          <h4>{{ userProfile.identity.firstname }} {{ userProfile.identity.lastname }}</h4>
          <q-btn :disable="isPlanningRouterDisable" flat size="sm" color="primary" icon="date_range"
            @click="goToPlanning" />
        </div>
      </div>
      <div class="row custom-justify-end col-xs-4 col-md-2">
        <img :src="hasPicture" alt="Img user" class="avatar">
      </div>
    </div>
    <div class="row col-xs-12 profile-info">
      <div class="col-6 q-pl-lg">
        <div class="row items-center">
          <div :class="['dot', userActivity.active ? 'dot-active' : 'dot-inactive']" />
          <div>{{ userActivity.status }}</div>
        </div>
        <div class="row items-center">
          <q-icon name="restore" class="q-mr-md" size="1rem" />
          <div class="q-mr-md">Depuis le {{ userStartDate }} ({{ userRelativeStartDate }})</div>
        </div>
      </div>
      <div class="q-pl-lg col-6 row">
        <div class="relative-position">
          <q-icon size="36px" name="phone_iphone" color="grey-2" />
          <q-icon v-if="!userProfile.isConfirmed" class="chip-icon" name="cancel" color="secondary" size="16px" />
          <q-icon v-if="userProfile.isConfirmed" class="chip-icon" name="check_circle" color="accent" size="16px" />
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
import { mapGetters, mapState } from 'vuex';
import Users from '@api/Users';
import Twilio from '@api/Twilio';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { DEFAULT_AVATAR } from '@data/constants';

export default {
  name: 'ProfileHeader',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  props: {
    customer: { type: Boolean, default: false },
    profileId: String,
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
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ userProfile: 'rh/getUserProfile' }),
    isPlanningRouterDisable () {
      return !this.userProfile.contracts || !this.userProfile.contracts.length;
    },
    companyName () {
      return get(this.loggedUser, 'company.tradeName');
    },
    userActivity () {
      return {
        status: this.userProfile.isActive ? 'Profil Actif' : 'Profil Inactif',
        active: this.userProfile.isActive,
      }
    },
    userStartDate () {
      if (this.userProfile.createdAt) return this.$moment(this.userProfile.createdAt).format('DD/MM/YY');
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return this.$moment(this.userStartDate, 'DD/MM/YY').toNow(true);
      return '';
    },
    isExternalUser () {
      return this.userProfile._id !== this.loggedUser._id;
    },
    isAccountConfirmed () {
      if (this.userProfile.isConfirmed) return 'Accès WebApp activé';
      return 'Accès WebApp non activé'
    },
    hasPicture () {
      return get(this.userProfile, 'picture.link') || DEFAULT_AVATAR;
    },
  },
  methods: {
    async updateMessage () {
      if (this.messageType === 'PM') {
        this.message = `Bonjour ${this.userProfile.identity.firstname},\nIl manque encore des informations et ` +
        'documents importants pour compléter ton dossier.\nClique ici pour compléter ton profil: ' +
        `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/auxiliaries/info` +
        '\nSi tu rencontres des difficultés, n’hésite pas à t’adresser à ton/ta coach ou ta marraine.';
      } else if (this.messageType === 'LA') {
        if (!this.userProfile.passwordToken || this.$moment().isAfter(this.userProfile.passwordToken.expiresIn)) {
          this.userProfile.passwordToken = await Users.createPasswordToken(this.userProfile._id, { email: this.userProfile.local.email });
        }
        this.message = `${this.companyName}. Bienvenue ! :)\nPour pouvoir ` +
          'commencer ton enregistrement sur Compani avant ton intégration, crée ton mot de passe en suivant ce lien: ' +
          `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/reset-password/${this.userProfile.passwordToken.token} :-)\n` +
          `Par la suite pour te connecter suis ce lien: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}.`;
      } else this.message = '';
    },
    openSmsModal () {
      this.updateMessage();
      this.smsModal = true;
    },
    goToPlanning () {
      if (this.customer) this.$router.push({ name: 'customers planning', params: { targetedCustomer: this.userProfile } });
      else this.$router.push({ name: 'auxiliaries planning', params: { targetedAuxiliary: this.userProfile } });
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
        if (!this.companyName) return NotifyNegative('Veuillez renseigner votre nom commercial dans la page de configuration.');
        await Twilio.sendSMS({
          to: `+33${this.userProfile.contact.phone.substring(1)}`,
          body: this.message,
        });
        NotifyPositive('SMS bien envoyé.');
      } catch (e) {
        console.error(e);
        this.loading = false;
        NotifyNegative('Erreur lors de l\'envoi du SMS.');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .avatar
    width: 59px
    height: 59px
    border: 1px solid #979797

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
    @media (max-width: 767px)
      justify-content: center
</style>
