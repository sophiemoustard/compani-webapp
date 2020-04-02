<template>
  <div>
    <p class="text-weight-bold">Identité</p>
    <div class="row gutter-profile q-mb-xl">
      <ni-input v-model.trim="mergedUserProfile.identity.firstname" caption="Prénom" @focus="saveTmp('identity.firstname')"
        @blur="updateUser('identity.firstname')" />
      <ni-input v-model.trim="mergedUserProfile.identity.lastname" caption="Nom" @focus="saveTmp('identity.lastname')"
        @blur="updateUser('identity.lastname')" />
      <div class="col-12 col-md-6 row items-center">
        <div class="col-xs-11">
          <ni-input ref="userEmail" name="emailInput" caption="Adresse email" :error="$v.mergedUserProfile.local.email.$error"
            :error-label="emailError" type="email" lower-case :disable="emailLock" v-model.trim="mergedUserProfile.local.email"
            @focus="saveTmp('local.email')" />
        </div>
        <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
          <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import set from 'lodash/set';
import { extend } from '@helpers/utils';
import Users from '@api/Users';
import Input from '@components/form/Input';
import { NotifyNegative } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';
import { userMixin } from '@mixins/userMixin';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin, userMixin],
  components: {
    'ni-input': Input,
  },
  data () {
    return {
      tmpInput: '',
      mergedUserProfile: {
        identity: { lastname: '', firstname: '' },
        local: { email: '' },
      },
      emailLock: true,
    };
  },
  validations () {
    return {
      mergedUserProfile: { identity: { lastname: { required } }, local: { email: { required, email } } },
    }
  },
  async mounted () {
    this.mergeUser(this.userProfile);
    this.$v.mergedUserProfile.$touch();
    this.isLoaded = true;
  },

  watch: {
    userProfile (value) {
      if (this.emailLock && !isEqual(value, this.mergedUserProfile)) {
        this.mergeUser(value);
      }
    },
  },
  methods: {
    async toggleEmailLock (toLock) {
      if (!toLock) {
        this.emailLock = false;
        await this.$nextTick();
        this.$refs.userEmail.$refs.emailInput.focus();
      } else {
        await this.updateUser('local.email');
      }
    },

    mergeUser (value = null) {
      const args = [this.mergedUserProfile, value];
      this.mergedUserProfile = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateAlenviUser (path) {
      const value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);
      await Users.updateById(this.mergedUserProfile._id, payload);
    },
    async emailErrorHandler (path) {
      try {
        NotifyNegative('Email déjà existant.');
        this.mergedUserProfile.local.email = this.tmpInput;
        await this.$nextTick();
        this.$refs.userEmail.select();
      } catch (e) {
        console.error(e);
      }
    },

  },
  computed: {
    ...mapGetters({ userProfile: 'rh/getUserProfile' }),
    emailError () {
      if (!this.$v.mergedUserProfile.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.mergedUserProfile.local.email.email) {
        return 'Email non valide';
      }
      return '';
    },
    lockIcon () {
      return this.emailLock ? 'lock' : 'lock_open';
    },
  },
};
</script>
