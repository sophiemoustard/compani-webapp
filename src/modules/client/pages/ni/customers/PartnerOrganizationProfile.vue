<template>
  <div>
    <q-page padding class="client-background">
      <ni-profile-header :title="partnerOrganizationName" />
      <p class="text-weight-bold">Informations</p>
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
      <p class="text-weight-bold q-mt-lg">Partenaires</p>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" label="Ajouter un partenaire" @click="partnerCreationModal = true" />
      </q-card-actions>
    </q-page>

    <partner-creation-modal v-model="partnerCreationModal" :new-partner.sync="newPartner" @submit="createPartner"
      :validations="$v.newPartner" :loading="modalLoading" @hide="resetModal" />
  </div>
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
import Button from '@components/Button';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';
import PartnerCreationModal from 'src/modules/client/components/customers/PartnerCreationModal';

export default {
  metaInfo: { title: 'Fiche structure partenaire' },
  props: {
    partnerOrganizationId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-button': Button,
    'partner-creation-modal': PartnerCreationModal,
  },
  mixins: [validationMixin, partnerOrganizationMixin],
  data () {
    return {
      partnerOrganization: { name: '', phone: '', address: {}, email: '' },
      tmpInput: '',
      partnerOrganizationName: '',
      partnerCreationModal: false,
      newPartner: { identity: { firstname: '', lastname: '' }, email: '', job: '' },
      modalLoading: false,
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
    newPartner: {
      identity: { lastname: { required }, firstname: { required }, required },
      phone: { frPhoneNumber },
      email: { email },
    },
  },
  async created () {
    await this.refreshPartnerOrganization();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.partnerOrganization, path);
    },
    async refreshPartnerOrganization () {
      try {
        this.partnerOrganization = await PartnerOrganization.getById(this.partnerOrganizationId);
        this.partnerOrganizationName = this.partnerOrganization.name;
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

        NotifyPositive('Modification enregistrée.');

        await this.refreshPartnerOrganization();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
    async createPartner () {
      try {
        this.modalLoading = true;

        this.$v.newPartner.$touch();
        if (this.$v.newPartner.$error) return NotifyWarning('Champ(s) invalide(s).');

        await PartnerOrganization.createPartner(this.partnerOrganizationId, this.newPartner);

        this.partnerCreationModal = false;
        NotifyPositive('Partenaire créé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetModal () {
      this.$v.newPartner.$reset();
      this.newPartner = { identity: { firstname: '', lastname: '' }, email: '', job: '' };
    },
  },
};
</script>
