<template>
  <div>
    <div class="row col-xs-12 q-mb-md">
      <div :class="[customer ? 'col-xs-12': 'col-xs-8', 'row', 'items-baseline', 'col-md-10']">
        <div class="row items-center">
          <q-icon v-if="isExternalUser" class="on-left cursor-pointer" size="1rem" name="arrow_back" color="primary"
            @click.native="$router.go(-1)" />
          <h4>{{ user.identity.firstname }} {{ user.identity.lastname }}</h4>
          <router-link :to="customerPlanningRouterLink" v-if="customer">
            <q-icon class="on-right cursor-pointer" size="1.2rem" name="date range" />
          </router-link>
        </div>
      </div>
      <div v-if="!customer" class="row custom-justify-end col-xs-4 col-md-2">
        <img :src="hasPicture" alt="Img user" class="avatar">
      </div>
    </div>
    <div class="row col-xs-12 profile-info">
      <div :class="[customer ? 'col-xs-12': 'col-xs-6', 'q-pl-lg', 'col-md-6', 'profile-info-item']">
        <div class="row items-center">
          <div class="row items-center justify-center on-left" style="width: 17px; height: 17px">
            <div :class="[{ activeDot: userActivity.active, inactiveDot: !userActivity.active }]" />
          </div>
          <div>{{ userActivity.status }}</div>
        </div>
        <div class="row items-center">
          <q-icon name="restore" class="on-left" size="1rem" />
          <div class="on-left">Depuis le {{ userStartDate }} ({{ userRelativeStartDate }})</div>
          <ni-icon v-if="customer" name="delete" color="grey" size="1rem" :disable="!!user.firstIntervention"
            @click=deleteCustomer />
        </div>
      </div>
      <div v-if="!customer" class="q-pl-lg col-xs-6 col-md-6 row profile-info-item">
        <div class="relative-position" style="width: 37px;">
          <q-icon size="36px" name="phone_iphone" color="grey-2" />
          <q-icon v-if="!user.isConfirmed" class="chip-icon" name="cancel" color="secondary" size="16px" />
          <q-icon v-if="user.isConfirmed" class="chip-icon" name="check_circle" color="accent" size="16px" />
        </div>
        <div class="column">
          <div class="text-weight-bold">{{ isAccountConfirmed }}</div>
          <div class="send-message-link" @click="opened = true">Envoyer un SMS</div>
        </div>
      </div>
    </div>

    <!-- Modal envoi message -->
    <ni-modal v-model="opened">
      <template slot="title">
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="typeMessageOptions" v-model="typeMessage" required-field />
      <ni-input in-modal caption="Message" v-model="messageComp" type="textarea" :rows="7" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary"
          :loading="loading" @click.native="sendMessage" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import randomize from 'randomatic';
import Input from './form/Input';
import Select from './form/Select';
import Modal from './Modal';
import { NotifyPositive, NotifyNegative } from './popup/notify';
import Icon from './Icon';
import { DEFAULT_AVATAR } from '../data/constants';

export default {
  name: 'ProfileHeader',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-icon': Icon,
    'ni-modal': Modal,
  },
  props: {
    customer: { type: Boolean, default: false },
    profileId: String,
  },
  data () {
    return {
      loading: false,
      opened: false,
      message: '',
      typeMessage: 'PM',
      messageSupport: 'sms',
      typeMessageOptions: [
        { label: 'Pièces manquantes', value: 'PM' },
        { label: 'Envoi code d\'activation', value: 'CA' },
        { label: 'Autres', value: 'Autres' },
      ],
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'main/user',
      user: 'rh/getUserProfile',
    }),
    companyName () {
      return this.$_.get(this.currentUser, 'company.tradeName');
    },
    userActivity () {
      if (this.customer) {
        return {
          status: this.user.firstIntervention ? 'Client' : 'Prospect',
          active: !!this.user.firstIntervention,
        }
      }
      return {
        status: this.user.isActive ? 'Profil Actif' : 'Profil Inactif',
        active: this.user.isActive,
      }
    },
    userStartDate () {
      if (this.user.createdAt) return this.$moment(this.user.createdAt).format('DD/MM/YY');
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return this.$moment(this.userStartDate, 'DD/MM/YY').toNow(true);
      return '';
    },
    isExternalUser () {
      return this.user._id !== this.currentUser._id;
    },
    isAccountConfirmed () {
      if (this.user.isConfirmed) {
        return 'Accès WebApp activé'
      }
      return 'Accès WebApp non activé'
    },
    msgSupportOptions () {
      const options = [{ label: 'SMS', value: 'sms' }];
      if (this.user.facebook && this.user.facebook.address) {
        options.push({ label: 'Pigi', value: 'pigi' });
      }
      return options
    },
    activationCode () {
      return this.typeMessage === 'CA' ? randomize('0000') : '';
    },
    messageComp: {
      get () {
        if (this.typeMessage === 'PM') {
          return `Bonjour ${this.user.identity.firstname},\nIl manque encore des informations et documents importants pour ` +
          'compléter ton dossier.\nClique ici pour compléter ton profil: ' +
          `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/ni/${this.user._id}\nSi tu ` +
          'rencontres des difficultés, n’hésite pas à t’adresser à ton/ta coach ou ta marraine.';
        } else if (this.typeMessage === 'CA') {
          return `${this.companyName}. Bienvenue ! :)\nUtilise ce code: ${this.activationCode} pour pouvoir ` +
          'commencer ton enregistrement sur Compani avant ton intégration: ' +
          `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/enterCode :-)`;
        }
        return this.message;
      },
      set (value) {
        this.message = value;
      },
    },
    hasPicture () {
      return !this.user.picture || (this.user.picture && !this.user.picture.link) ? DEFAULT_AVATAR : this.user.picture.link;
    },
    customerPlanningRouterLink () {
      return {
        name: 'customers planning',
        params: { initialCustomer: this.user },
      };
    },
  },
  methods: {
    async sendMessage () {
      this.loading = true;
      if (this.typeMessage === 'CA') {
        await this.$activationCode.create({ code: this.activationCode, newUserId: this.user._id, userEmail: this.user.local.email });
      }
      await this.sendSMS();
      this.loading = false;
      this.opened = false;
    },
    async sendSMS () {
      try {
        if (!this.companyName) NotifyNegative('Veuillez renseigner votre nom commercial dans la page de configuration');
        await this.$twilio.sendSMS({
          to: `+33${this.user.contact.phone.substring(1)}`,
          from: this.companyName,
          body: this.messageComp,
        });
        NotifyPositive('SMS bien envoyé');
      } catch (e) {
        console.error(e);
        this.loading = false;
        NotifyNegative('Erreur lors de l\'envoi du SMS');
      }
    },
    async deleteCustomer () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Confirmez-vous la suppression ?',
          ok: 'OK',
          cancel: 'Annuler',
        }).onOk(async () => {
          await this.$customers.remove(this.user._id);
          NotifyPositive('Bénéficiaire supprimé.');
          this.$router.push({ name: 'customers directory' });
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        if (e.msg) NotifyNegative('Erreur lors de la suppression du bénéficiaire');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  h4
    margin: 0

  .avatar
    width: 59px
    height: 59px
    border: 1px solid #979797

  .profile-info
    font-size: 14px

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

  .custom-justify
    &-end
      justify-content: flex-end
      @media (max-width: 767px)
        justify-content: center
</style>
