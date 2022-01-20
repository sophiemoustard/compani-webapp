<template>
  <q-page padding class="client-background">
    <ni-profile-header :title="partnerOrganizationName" />
    <p class="text-weight-bold">Informations</p>
    <div class="row gutter-profile">
      <ni-input caption="Nom" v-model="partnerOrganization.name" @focus="saveTmp('name')"
        @blur="updatePartnerOrganization('name')" :error="v$.partnerOrganization.name.$error" />
      <ni-input caption="Téléphone" v-model="partnerOrganization.phone" @focus="saveTmp('phone')"
        @blur="updatePartnerOrganization('phone')" :error="v$.partnerOrganization.phone.$error"
        :error-message="phoneNumberError(v$.partnerOrganization)" />
      <ni-search-address v-model="partnerOrganization.address" @focus="saveTmp('address')"
        @blur="updatePartnerOrganization('address')" :error="v$.partnerOrganization.address.$error"
        :error-message="addressError(v$.partnerOrganization)" />
      <ni-input caption="Email" v-model="partnerOrganization.email" @focus="saveTmp('email')"
        @blur="updatePartnerOrganization('email')" :error="v$.partnerOrganization.email.$error"
        :error-message="emailError(v$.partnerOrganization)" />
    </div>
    <p class="text-weight-bold q-mt-lg">Partenaires</p>
    <q-card>
      <ni-expanding-table :data="partnerOrganization.partners" :columns="columns">
          <template #row="{ props }">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions items-center">
                  <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
                  <ni-button icon="edit" @click="openPartnerEditionModal(props.row)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </template>
          <template #expanding-row="{ props }">
            <q-td colspan="100%">
              <div v-if="!props.row.customerPartners.length" class="q-px-lg text-italic text-center">
                Aucun(e) bénéficiaire prescrit(e).
              </div>
              <div v-else v-for="customerPartner in props.row.customerPartners" :key="customerPartner._id"
                :props="props" class="q-px-lg q-my-sm row justify-between">
                <div>{{ formatIdentity(customerPartner.customer.identity, 'FL') }}</div>
                <div class="q-mr-xl">créé le {{ formatDate(customerPartner.customer.createdAt) }}</div>
              </div>
            </q-td>
          </template>
      </ni-expanding-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" label="Ajouter un(e) partenaire" @click="partnerCreationModal = true" />
      </q-card-actions>
    </q-card>

    <partner-creation-modal v-model="partnerCreationModal" v-model:new-partner="newPartner" @submit="createPartner"
      :validations="v$.newPartner" :loading="modalLoading" @hide="resetCreationModal" />

    <partner-edition-modal v-model="partnerEditionModal" v-model:edited-partner="editedPartner" @submit="updatePartner"
      :validations="v$.editedPartner" :loading="modalLoading" @hide="resetEditionModal" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required, email, requiredIf } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import PartnerOrganization from '@api/PartnerOrganizations';
import Partner from '@api/Partners';
import ProfileHeader from '@components/ProfileHeader';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import Button from '@components/Button';
import ExpandingTable from '@components/table/ExpandingTable';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { formatIdentity, formatPhone, sortStrings } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { validationMixin } from '@mixins/validationMixin';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';
import PartnerCreationModal from 'src/modules/client/components/customers/PartnerCreationModal';
import PartnerEditionModal from 'src/modules/client/components/customers/PartnerEditionModal';
import { JOB_OPTIONS } from '@data/constants';

export default {
  props: {
    partnerOrganizationId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-button': Button,
    'ni-expanding-table': ExpandingTable,
    'partner-creation-modal': PartnerCreationModal,
    'partner-edition-modal': PartnerEditionModal,
  },
  setup () {
    const metaInfo = { title: 'Fiche structure partenaire' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  mixins: [validationMixin, partnerOrganizationMixin],
  data () {
    return {
      partnerOrganization: { name: '', phone: '', address: {}, email: '' },
      tmpInput: '',
      partnerOrganizationName: '',
      partnerCreationModal: false,
      newPartner: { identity: { firstname: '', lastname: '' }, email: '', phone: '', job: '' },
      modalLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'identity',
          format: value => formatIdentity(value, 'FL'),
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
        },
        { name: 'email', label: 'Mail', align: 'left', field: 'email', sortable: true },
        { name: 'phone', label: 'Téléphone', align: 'left', field: 'phone', format: formatPhone, sortable: true },
        {
          name: 'job',
          label: 'Fonction',
          align: 'left',
          field: 'job',
          format: value => (value ? JOB_OPTIONS.find(job => job.value === value).label : ''),
          sortable: true,
        },
        {
          name: 'prescriptions',
          label: 'Prescriptions',
          field: 'customerPartners',
          align: 'left',
          format: value => value.length,
          sortable: true,
        },
        { name: 'actions', label: '', align: 'center' },
      ],
      partnerEditionModal: false,
      editedPartner: { identity: { firstname: '', lastname: '' }, email: '', phone: '', job: '' },
      formatIdentity,
      formatDate,
    };
  },
  validations () {
    return {
      partnerOrganization: {
        name: { required },
        phone: { frPhoneNumber },
        address: {
          zipCode: { required: requiredIf(!!get(this.partnerOrganization, 'address.fullAddress')) },
          street: { required: requiredIf(!!get(this.partnerOrganization, 'address.fullAddress')) },
          city: { required: requiredIf(!!get(this.partnerOrganization, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        email: { email },
      },
      newPartner: {
        identity: { lastname: { required } },
        phone: { frPhoneNumber },
        email: { email },
      },
      editedPartner: {
        identity: { lastname: { required } },
        phone: { frPhoneNumber },
        email: { email },
      },
    };
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

        this.v$.partnerOrganization.$touch();
        if (get(this.v$, `partnerOrganization.${path}.$error`)) return NotifyWarning('Champ(s) invalide(s).');

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

        this.v$.newPartner.$touch();
        if (this.v$.newPartner.$error) return NotifyWarning('Champ(s) invalide(s).');

        await PartnerOrganization.createPartner(this.partnerOrganizationId, this.newPartner);

        this.partnerCreationModal = false;
        NotifyPositive('Partenaire créé.');

        await this.refreshPartnerOrganization();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du/de la partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetCreationModal () {
      this.v$.newPartner.$reset();
      this.newPartner = { identity: { firstname: '', lastname: '' }, email: '', phone: '', job: '' };
    },
    openPartnerEditionModal (row) {
      this.editedPartner = cloneDeep(row);
      this.partnerEditionModal = true;
    },
    async updatePartner () {
      try {
        this.modalLoading = true;

        this.v$.editedPartner.$touch();
        if (this.v$.editedPartner.$error) return NotifyWarning('Champ(s) invalide(s).');

        const payload = omit(this.editedPartner, ['_id', 'customerPartners', 'partnerOrganization']);
        await Partner.updateById(this.editedPartner._id, payload);

        this.partnerEditionModal = false;
        NotifyPositive('Partenaire modifié.');

        await this.refreshPartnerOrganization();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du/de la partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetEditionModal () {
      this.v$.editedPartner.$reset();
      this.editedPartner = { identity: { firstname: '', lastname: '' }, email: '', phone: '', job: '' };
    },
  },
};
</script>
