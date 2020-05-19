<template>
  <div>
    <p class="text-weight-bold">Identité</p>
    <div class="row gutter-profile q-mb-lg">
      <ni-input v-model.trim="mergedUserProfile.identity.firstname" caption="Prénom"
        @focus="saveTmp('identity.firstname')" @blur="updateUser('identity.firstname')" />
      <ni-input v-model.trim="mergedUserProfile.identity.lastname" caption="Nom" @focus="saveTmp('identity.lastname')"
        @blur="updateUser('identity.lastname')" :error="$v.mergedUserProfile.identity.lastname.$error" />
      <div class="col-12 col-md-6 row items-center">
        <div class="col-xs-11">
          <ni-input ref="userEmail" name="emailInput" caption="Adresse email" type="email" lower-case
            :error="$v.mergedUserProfile.local.email.$error" :error-label="emailError($v.mergedUserProfile)"
            :disable="emailLock" v-model.trim="mergedUserProfile.local.email" @focus="saveTmp('local.email')" />
        </div>
        <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
          <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
        </div>
      </div>
    </div>
    <div class="row gutter-profile q-mb-xl">
      <ni-input caption="Biographie du formateur" v-model="mergedUserProfile.biography" type="textarea"
        @blur="updateUser('biography')" @focus="saveTmp('biography')" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Input from '@components/form/Input';
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
      emailLock: true,
    };
  },
  validations () {
    return {
      mergedUserProfile: {
        identity: { lastname: { required } },
        local: { email: { required, email } },
      },
    }
  },
  computed: {
    ...mapGetters({ mergedUserProfile: 'rh/getUserProfile' }),
  },
  async mounted () {
    this.$v.mergedUserProfile.$touch();
    this.isLoaded = true;
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateAlenviUser (path) {
      const value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);

      await Users.updateById(this.mergedUserProfile._id, payload);
      this.$store.commit('rh/saveUserProfile', this.mergedUserProfile);
    },
  },
};
</script>
