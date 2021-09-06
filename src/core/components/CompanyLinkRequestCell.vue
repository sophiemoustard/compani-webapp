<template>
  <div class="request-cell">
    <q-card flat>
      <div v-if="user.picture" class="avatar-container">
        <img :src="user.picture.link" class="avatar-test">
      </div>
      <div v-else class="avatar-container">
        <img :src="DEFAULT_AVATAR" class="default-avatar q-my-sm">
      </div>
      <p class="text-copper-grey-700 text-weight-bold q-my-md q-mx-md">
        {{ user.identity.firstname }} {{ user.identity.lastname }}
      </p>
      <div class="column q-ma-sm">
        <ni-button class="validation-button" label="Confirmer" @click="validateLinkRequestCreation" />
        <ni-button class="delete-button" label="Supprimer" />
      </div>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Button from '@components/Button';
import { NotifyPositive } from '@components/popup/notify';
import Users from '@api/Users';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'CompanyLinkRequestCell',
  metadata: { title: 'Tableau de bord des formations' },
  props: {
    user: { type: Object, default: () => {} },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
    };
  },
  computed: {
    ...mapState({ userProfile: state => state.main.loggedUser }),
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async createLinkRequest () {
      await Users.updateById(this.user._id, { company: this.userProfile.company._id });
      this.$emit('click');
    },
    validateLinkRequestCreation () {
      this.$q.dialog({
        title: 'Voulez-vous vraiment rattacher ce compte ?',
        message: `<div class="row q-my-md items-center">
            <img class="avatar q-mx-md" src="${this.getAvatar(this.user.picture)}"/>
            <div>
              <div>${this.user.identity.firstname} ${this.user.identity.lastname}</div>
              <div style="font-size: 14px" class="text-copper-grey-500">${this.user.local.email}</div>
            </div>
          </div>
        En l’ajoutant, vous confirmez que vous êtes employeur de cette personne.<br />
        Vous aurez alors accès à son historique de formation sur Compani.`,
        html: true,
        ok: 'Rattacher ce compte',
        cancel: 'Annuler',
      })
        .onOk(this.createLinkRequest)
        .onCancel(() => NotifyPositive('Rattachement à la structure annulé.'));
    },
  },
};
</script>

<style lang="stylus" scoped>
.request-cell
  border-radius: 10px
  width: 170px
.avatar-container
  height: 120px
  background-color : $copper-grey-50
  display: flex
  justify-content: center
.default-avatar
  border-radius: 50%
  width: 95px
  height: 95px
  border-radius: 50%
  box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12)
  vertical-align: middle
  @media screen and (max-width: $breakpoint-sm-max)
    height: 60px
    width: 60px
.avatar-test
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 10px 10px 0px 0px
.validation-button
  color: white
  background: $primary
  margin: 5px
.delete-button
  color: $primary
  background: white
  border: 1px solid $primary
  margin: 5px
.email-test
  font-size: 14px
  color: white
</style>
