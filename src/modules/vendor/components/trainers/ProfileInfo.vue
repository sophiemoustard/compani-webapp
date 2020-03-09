<template>
  <div class="row gutter-profile q-mb-xl">
    <div class="col-xs-12 col-md-6">
      <p class="text-weight-bold">Identité</p>
      <ni-input v-model.trim="mergedUserProfile.identity.firstname" caption="Prénom" @focus="saveTmp('identity.firstname')"
        @blur="updateUser('identity.firstname')" />
      <ni-input v-model.trim="mergedUserProfile.identity.lastname" caption="Nom" @focus="saveTmp('identity.lastname')"
        @blur="updateUser('identity.lastname')" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import { extend } from '@helpers/utils';
import Users from '@api/Users';
import Input from '@components/form/Input';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin],
  components: {
    'ni-input': Input,
  },
  data () {
    return { mergedUserProfile: { identity: { lastname: '', firstname: '' } } };
  },
  validations () {
    return {
      mergedUserProfile: { identity: { lastname: { required } } },
    }
  },
  async mounted () {
    const mergedUserProfile = await Users.getById(this.userProfile._id);
    this.mergeUser(mergedUserProfile);
    this.$v.mergedUserProfile.$touch();
    this.isLoaded = true;
  },

  watch: {
    userProfile (value) {
      this.mergeUser(value);
    },
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.mergedUserProfile, value];
      this.mergedUserProfile = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateUser (path) {
      try {
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
      }
    },
    async updateAlenviUser (path) {
      let value = get(this.mergedUserProfile, path);
      const payload = set({}, path, value);
      await Users.updateById(this.mergedUserProfile._id, payload);
    },
  },
  computed: {
    ...mapGetters({ userProfile: 'rh/getUserProfile' }),
  },
};
</script>
