<template>
  <div>
    <div class="q-mb-xl">
      <div class="photo-caption">Photo</div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-picture-uploader :user="userProfile" :refresh-picture="refreshUser" />
        </div>
      </div>
    </div>
    <div class="row gutter-profile q-mb-lg">
      <ni-input v-model.trim="userProfile.identity.firstname" caption="Prénom"
        @focus="saveTmp('identity.firstname')" @blur="updateUser('identity.firstname')" />
      <ni-input v-model.trim="userProfile.identity.lastname" caption="Nom" @focus="saveTmp('identity.lastname')"
        @blur="updateUser('identity.lastname')" :error="$v.userProfile.identity.lastname.$error" />
      <div class="col-12 col-md-6 row items-center">
        <div class="col-xs-11">
          <ni-input ref="userEmail" name="emailInput" caption="Adresse email" type="email" lower-case
            :error="$v.userProfile.local.email.$error" :error-message="emailError($v.userProfile)"
            :disable="emailLock" v-model.trim="userProfile.local.email" @focus="saveTmp('local.email')" />
        </div>
        <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
          <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
        </div>
      </div>
      <ni-input v-model.trim="userProfile.contact.phone" @focus="saveTmp('contact.phone')"
          :error-message="phoneNbrError($v.userProfile)" @blur="updateUser('contact.phone')" caption="Téléphone"
          :error="$v.userProfile.contact.phone.$error" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Input from '@components/form/Input';
import PictureUploader from '@components/PictureUploader';
import { NotifyNegative } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { AUXILIARY_ROLES } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin, userMixin],
  components: {
    'ni-input': Input,
    'ni-picture-uploader': PictureUploader,
  },
  data () {
    return {
      tmpInput: '',
      emailLock: true,
    };
  },
  validations () {
    return {
      userProfile: {
        identity: { lastname: { required } },
        local: {
          email: { required, email },
        },
        contact: {
          phone: { frPhoneNumber, required: requiredIf(() => this.isAuxiliary) },
        },
      },
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(get(this.userProfile, 'role.client.name'));
    },
  },
  async mounted () {
    this.$v.userProfile.$touch();
    this.isLoaded = true;
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.userProfile, path);
    },
    async updateAlenviUser (path) {
      try {
        const value = get(this.userProfile, path);
        const payload = set({}, path, value);

        await Users.updateById(this.userProfile._id, payload);
        await this.refreshUser();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modifiation de l\'apprenant');
      }
    },
    async refreshUser () {
      await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.userProfile._id });
    },
  },
};
</script>

<style lang="stylus" scoped>

.photo-caption
  font-size: 12px
  margin: 0 0 4px 0

</style>
