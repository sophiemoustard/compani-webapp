<template>
  <q-page padding class="client-background">
    <ni-profile-header :title="partnerOrganization.name" />
    <div class="row justify-between items-baseline">
      <p class="text-weight-bold">Informations</p>
    </div>
    <div class="row gutter-profile">
      <ni-input caption="Nom" v-model="partnerOrganization.name" @focus="saveTmp('name')"
        @blur="updatePartnerOrganization('name')" :error="$v.partnerOrganization.name.$error" />
      <ni-input caption="Téléphone" v-model="partnerOrganization.phone" @focus="saveTmp('phone')"
        @blur="updatePartnerOrganization('phone')" :error="$v.partnerOrganization.phone.$error"
        :error-message="phoneNumberError($v.partnerOrganization)" />
      <ni-search-address v-model="partnerOrganization.address" @focus="saveTmp('address')"
        @blur="updatePartnerOrganization('address')" :error="$v.partnerOrganization.address.$error"
      :error-message="addressError($v.partnerOrganization)" />
      <ni-input caption="Email" v-model="partnerOrganization.email" @focus="saveTmp('email')"
        @blur="updatePartnerOrganization('email')" :error="$v.partnerOrganization.email.$error"
        :error-message="emailError($v.partnerOrganization)" />
    </div>
  </q-page>
</template>

<script>
import { required, email, requiredIf } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import PartnerOrganization from '@api/PartnerOrganizations';
import ProfileHeader from '@components/ProfileHeader';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';

export default {
  metaInfo: { title: 'Structure partenaire' },
  props: {
    partnerOrganizationId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-search-address': SearchAddress,
    'ni-input': Input,
  },
  mixins: [validationMixin, partnerOrganizationMixin],
  data () {
    return {
      partnerOrganization: { name: '', phone: '', address: {}, email: '' },
      tmpInput: '',
    };
  },
  validations: {
    partnerOrganization: {
      name: { required },
      phone: { frPhoneNumber },
      address: {
        zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
        street: { required: requiredIf(item => item && !!item.fullAddress) },
        city: { required: requiredIf(item => item && !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      email: { email },
    },
  },
  async mounted () {
    await this.refreshPartnerOrganization();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.partnerOrganization, path);
    },
    async refreshPartnerOrganization () {
      try {
        this.partnerOrganization = await PartnerOrganization.getById(this.partnerOrganizationId);
      } catch (e) {
        this.partnerOrganization = { name: '', phone: '', address: {}, email: '' };
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de la structure partenaire.');
      }
    },
    async updatePartnerOrganization (path) {
      try {
        const value = get(this.partnerOrganization, path);
        if (this.tmpInput === value) return;

        this.$v.partnerOrganization.$touch();
        if (get(this.$v, `partnerOrganization.${path}.$error`)) return NotifyWarning('Champ(s) invalide(s).');

        let payload = set({}, path, value);
        if (payload.address && !payload.address.fullAddress) payload = { address: {} };
        await PartnerOrganization.updateById(this.partnerOrganizationId, payload);

        NotifyPositive('Modification enregistrée');

        await this.refreshPartnerOrganization();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
  },
};
</script>
