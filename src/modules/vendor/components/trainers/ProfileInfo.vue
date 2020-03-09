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
          <ni-input ref="userEmail" :name="emailInputRef" caption="Adresse email" :error="$v.mergedUserProfile.local.email.$error"
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
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin],
  components: {
    'ni-input': Input,
  },
  data () {
    return {
      emailInputRef: 'emailInput',
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
    const user = await Users.getById(this.userProfile._id);
    this.mergeUser(user);
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
    async updateUser (path) {
      try {
        if (this.tmpInput === get(this.mergedUserProfile, path)) {
          this.emailLock = true;
          return;
        }

        if (get(this.$v.mergedUserProfile, path)) {
          get(this.$v.mergedUserProfile, path).$touch();
          const isValid = await this.waitForValidation(this.$v.mergedUserProfile, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        await this.updateAlenviUser(path);

        this.$store.commit('rh/saveUserProfile', this.mergedUserProfile);
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
        this.emailLock = true;
      }
    },
    async updateAlenviUser (path) {
      let value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);
      await Users.updateById(this.mergedUserProfile._id, payload);
    },
    async emailErrorHandler (path) {
      try {
        NotifyNegative('Email déjà existant');
        this.mergedUserProfile.local.email = this.mergedUserProfile.local.email;
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
