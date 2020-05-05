<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Raison sociale" v-model.trim="company.name" @focus="saveTmp('name')"
          @blur="updateCompany('name')" :error="$v.company.name.$error" />
        <ni-input caption="Nom commercial" v-model.trim="company.tradeName" @focus="saveTmp('tradeName')"
          @blur="updateCompany('tradeName')" :error="$v.company.tradeName.$error" />
      </div>
    </div>
    <ni-coach-config-table :users="users" :company="company" @refreshUsers="getUsers" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
import Companies from '@api/Companies';
import Users from '@api/Users';
import Input from '@components/form/Input';
import CoachConfigTable from '@components/table/CoachConfigTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { CLIENT_ADMIN, COACH } from '@data/constants';
import { companyMixin } from '@mixins/companyMixin'

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-coach-config-table': CoachConfigTable,
  },
  mixins: [companyMixin],
  data () {
    return {
      users: [],
    };
  },
  validations () {
    return {
      company: pick(this.companyValidation, ['name', 'tradeName']),
    };
  },
  computed: {
    ...mapState('company', ['company']),
  },
  async mounted () {
    if (!this.company) await this.refreshCompany();
    await this.getUsers();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path)
    },
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/get', { companyId: this.profileId });
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
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    async getUsers () {
      try {
        this.usersLoading = true;
        this.users = await Users.list({ role: [CLIENT_ADMIN, COACH], company: this.company._id });
      } catch (e) {
        console.error(e);
        this.users = [];
      } finally {
        this.usersLoading = false;
      }
    },
  },
}
</script>
