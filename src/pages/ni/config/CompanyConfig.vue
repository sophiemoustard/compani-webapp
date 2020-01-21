<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration générale</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Raison sociale" v-model="company.name" @focus="saveTmp('name')"
            @blur="updateCompany('name')" />
          <ni-input caption="Nom commercial" v-model="company.tradeName" @focus="saveTmp('tradeName')"
            @blur="updateCompany('tradeName')" :error="$v.company.tradeName.$error"
            :error-label="tradeNameError" />
          <ni-search-address v-model="company.address" color="white" inverted-light :error-label="addressError"
            @focus="saveTmp('address.fullAddress')" @blur="updateCompany('address')"
            :error="$v.company.address.$error" />
          <ni-input caption="Numéro ICS" v-model="company.ics" @focus="saveTmp('ics')" @blur="updateCompany('ics')" />
          <ni-input v-if="company.type === COMPANY" caption="Numéro RCS" v-model="company.rcs" @focus="saveTmp('rcs')"
            @blur="updateCompany('rcs')" />
          <ni-input v-else caption="Numéro RNA" v-model="company.rna" @focus="saveTmp('rna')"
            @blur="updateCompany('rna')" />
          <ni-input caption="IBAN" :error="$v.company.iban.$error" :error-label="ibanError" v-model.trim="company.iban"
            @focus="saveTmp('iban')" upper-case @blur="updateCompany('iban')" />
          <ni-input caption="BIC" :error="$v.company.bic.$error" :error-label="bicError" upper-case
            v-model.trim="company.bic" @focus="saveTmp('bic')" @blur="updateCompany('bic')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Paie</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-input caption="Code APE/NAF" :error="$v.company.apeCode.$error" error-label="Code APE/NAF invalide"
              v-model="company.apeCode" mask="XXXXX" @focus="saveTmp('apeCode')" @blur="updateCompany('apeCode')" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { required, requiredIf, maxLength } from 'vuelidate/lib/validators';
import { configMixin } from '../../../mixins/configMixin';
import { validationMixin } from '../../../mixins/validationMixin.js';
import { tableMixin } from '../../../mixins/tableMixin.js';
import Input from '../../../components/form/Input';
import SearchAddress from '../../../components/form/SearchAddress.vue';
import { frAddress, iban, bic, apeCode } from '../../../helpers/vuelidateCustomVal';
import { REQUIRED_LABEL, COMPANY, ASSOCIATION } from '../../../data/constants.js';

export default {
  name: ' CompanyConfig',
  metaInfo: { title: 'Configuration générale' },
  components: {
    'ni-input': Input,
    'ni-search-address': SearchAddress,
  },
  mixins: [configMixin, validationMixin, tableMixin],
  data () {
    return {
      company: null,
      documents: null,
      COMPANY,
    };
  },
  validations: {
    company: {
      apeCode: { required, apeCode },
      ics: { required },
      name: { required },
      tradeName: { required, maxLength: maxLength(11) },
      type: { required },
      rcs: { required: requiredIf(item => item.type === COMPANY) },
      rna: { required: requiredIf(item => item.type === ASSOCIATION) },
      iban: { required, iban },
      bic: { required, bic },
      address: {
        zipCode: { required },
        street: { required },
        city: { required },
        fullAddress: { required, frAddress },
        location: { required },
      },
    },
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    addressError () {
      return !this.$v.company.address.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.company.iban.required) return REQUIRED_LABEL;
      else if (!this.$v.company.iban.iban) return 'IBAN non valide';

      return '';
    },
    bicError () {
      if (!this.$v.company.bic.required) return REQUIRED_LABEL;
      else if (!this.$v.company.bic.bic) return 'BIC non valide';

      return '';
    },
    tradeNameError () {
      if (!this.$v.company.tradeName.required) return REQUIRED_LABEL;
      else if (!this.$v.company.tradeName.maxLength) return 'Doit contenir 11 caractères max (espaces inclus).';

      return '';
    },
  },
  async mounted () {
    await this.refreshCompany();
  },
  methods: {
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
      this.company.address = this.company.address || { fullAddress: '' };
    },
  },
}
</script>

<style lang="less" scoped>

</style>
