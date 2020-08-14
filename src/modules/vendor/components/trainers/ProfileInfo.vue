<template>
  <div>
    <p class="text-weight-bold">Identité</p>
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
    </div>
    <div class="row gutter-profile q-mb-xl">
      <ni-input caption="Biographie du formateur" v-model="userProfile.biography" type="textarea"
        @blur="updateUser('biography')" @focus="saveTmp('biography')" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Input from '@components/form/Input';
import { NotifyNegative } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';
import { TRAINER } from '@data/constants';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin, userMixin],
  components: {
    'ni-input': Input,
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
        local: { email: { required, email } },
      },
    };
  },
  computed: {
    ...mapState({
      userProfile: state => (TRAINER === get(state.main.loggedUser, 'role.vendor.name')
        ? state.main.loggedUser
        : state.userProfile.userProfile),
    }),
    ...mapGetters({ vendorRole: 'main/getVendorRole' }),
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
        NotifyNegative('Erreur lors de la modifiation du formateur');
      }
    },
    async refreshUser () {
      TRAINER === this.vendorRole
        ? await this.$store.dispatch('main/fetchLoggedUser', this.userProfile._id)
        : await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.userProfile._id });
    },
  },
};
</script>
