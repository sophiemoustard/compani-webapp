<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="company.name" @focus="saveTmp('name')" @blur="updateCompany('name')" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Companies from '@api/Companies';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
  },
  validations () {
    return {
      company: {
        name: { required },
      },
    }
  },
  computed: {
    ...mapGetters({ company: 'company/getCompany' }),
  },
  async mounted () {
    if (!this.company) await this.refreshCompany();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path)
    },
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/getCompany', { companyId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateCompany (path) {
      try {
        const value = get(this.company, path);
        if (this.tmpInput === value) return;
        this.$v.company.$touch();
        if (this.$v.company.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = null;
      }
    },
  },
}
</script>
