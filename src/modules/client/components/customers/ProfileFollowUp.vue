<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Pratique</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Accès / codes" v-model="customer.contact.accessCodes" @focus="saveTmp('contact.accessCodes')"
          @blur="updateCustomer('contact.accessCodes')" />
        <ni-input v-if="isAuxiliary" caption="Téléphone" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-search-address v-if="isAuxiliary" caption='Adresse principale' v-model="customer.contact.primaryAddress"
          color="white" disable />
        <ni-search-address v-if="isAuxiliary && hasSecondaryAddress" caption='Adresse secondaire'
          v-model="customer.contact.secondaryAddress" color="white" disable />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Référent</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-md-6 col-xs-12 referent items-center">
          <img :src="auxiliaryAvatar" class="avatar q-mr-sm" />
          <ni-select v-model="customer.referent._id" :options="auxiliariesOptions" no-error icon="swap_vert"
            @input="updateCustomer('referent')" bg-color="grey-3" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Accompagnement</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Environnement du bénéficiaire" v-model="customer.followUp.environment"
          @blur="updateCustomer('followUp.environment')" @focus="saveTmp('followUp.environment')" type="textarea" />
        <ni-input caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" type="textarea" />
        <ni-input caption="Autres" v-model="customer.followUp.misc" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Aidants</p>
      </div>
      <ni-simple-table :data="sortedHelpers" :columns="helpersColumns" :visible-columns="visibleColumns"
        :loading="helpersLoading">
        <template v-slot:body="{ props }" >
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'phone'">
                <a v-if="col.value" class="text-primary" :href="getPhoneLink(col.value)">{{col.value}}</a>
                <div v-else>{{ col.value }}</div>
              </template>
             <template v-else>{{ col.value }}</template>
           </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
    </div>
    <div v-if="fundingsMonitoring.length" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <ni-simple-table :data="fundingsMonitoring" :columns="fundingsMonitoringColumns" :loading="fundingsLoading" />
    </div>
    <div class="q-mb-xl" v-if="customer.firstIntervention">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaires</p>
      </div>
      <ni-simple-table :data="customerFollowUp" :columns="followUpColumns" :pagination.sync="followUpPagination"
        :loading="followUpLoading">
        <template v-slot:body="{ props }" >
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'identity'">
                <q-item>
                  <q-item-section avatar>
                    <img :src="getAvatar(col.value)" class="avatar" />
                  </q-item-section>
                  <q-item-section>
                    <span class="identity-block q-mr-sm">{{ col.value.identity | formatIdentity('Fl') }} ({{ col.value.sector.name }})</span>
                  </q-item-section>
                </q-item>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import Customers from '@api/Customers';
import Stats from '@api/Stats';
import Users from '@api/Users';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyNegative } from '@components/popup/notify.js';
import SimpleTable from '@components/table/SimpleTable';
import { formatIdentity, formatHours } from '@helpers/utils.js';
import { AUXILIARY, PLANNING_REFERENT, AUXILIARY_ROLES, DEFAULT_AVATAR, UNKNOWN_AVATAR } from '@data/constants';
import { customerMixin } from 'src/modules/client/mixins/customerMixin.js';
import { validationMixin } from 'src/modules/client/mixins/validationMixin.js';
import { helperMixin } from 'src/modules/client/mixins/helperMixin.js';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
    'ni-simple-table': SimpleTable,
  },
  mixins: [customerMixin, validationMixin, helperMixin],
  data () {
    return {
      auxiliaries: [],
      isLoaded: false,
      tmpInput: '',
      loading: false,
      visibleColumns: ['lastname', 'firstname', 'email', 'phone'],
      customerFollowUp: [],
      followUpLoading: false,
      followUpColumns: [
        {
          name: 'identity',
          align: 'left',
          field: row => row,
        },
        {
          name: 'hours',
          align: 'center',
          label: 'Heures réalisées',
          field: row => formatHours(row.totalHours, 1),
        },
        {
          name: 'lastEvent',
          align: 'center',
          label: 'Dernière inter.',
          field: row => this.$moment(row.lastEvent.startDate).format('DD/MM/YYYY'),
        },
      ],
      followUpPagination: { rowsPerPage: 5 },
      fundingsMonitoring: [],
      fundingsLoading: false,
      fundingsMonitoringColumns: [
        {
          name: 'thirdPartyPayer',
          align: 'left',
          label: 'Financeur',
          field: 'thirdPartyPayer',
        },
        {
          name: 'careHours',
          align: 'center',
          label: 'Heures attribuées',
          field: 'careHours',
        },
        {
          name: 'prevMonthCareHours',
          align: 'center',
          label: 'Mois dernier',
          field: row => row.prevMonthCareHours === -1 ? 'N/A' : formatHours(row.prevMonthCareHours, 1),
        },
        {
          name: 'currentMonthCareHours',
          align: 'center',
          label: 'Mois en cours',
          field: row => formatHours(row.currentMonthCareHours, 1),
        },
      ],
    };
  },
  computed: {
    auxiliaryAvatar () {
      const auxiliaryPicture = get(this.customer, 'referent.picture') || null;
      return this.getAuxiliaryAvatar(auxiliaryPicture);
    },
    customer () {
      return this.$store.getters['customer/getCustomer'];
    },
    loggedUser () {
      return this.$store.getters['main/loggedUser'];
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.loggedUser.role.client.name);
    },
    hasSecondaryAddress () {
      return !!get(this.customer, 'contact.secondaryAddress.fullAddress');
    },
    auxiliariesOptions () {
      const auxiliariesOptions = [{ label: 'Pas de référent', value: '' }];
      const referentId = get(this.customer, 'referent._id') || null;
      if (this.auxiliaries.length) {
        auxiliariesOptions.push(...this.auxiliaries.map(aux => ({
          label: formatIdentity(aux.identity, 'FL'),
          value: aux._id,
        })));
      } else if (referentId) {
        const identity = get(this.customer, 'referent.identity') || {};
        auxiliariesOptions.push({ label: formatIdentity(identity, 'FL'), value: referentId });
      }

      return auxiliariesOptions;
    },
    auxiliaryPlaceholder () {
      return (this.customer.referent.identity)
        ? formatIdentity(this.customer.referent.identity, 'FL')
        : 'Pas de référent';
    },
  },
  async mounted () {
    await this.refreshCustomer();
    const promises = [this.getUserHelpers(), this.getAuxiliaries()];
    if (this.customer.firstIntervention) promises.push(this.getCustomerFollowUp());
    if (this.customer.fundings && this.customer.fundings.length) promises.push(this.getCustomerFundingsMonitoring());
    await Promise.all(promises);
  },
  methods: {
    getAuxiliaryAvatar (picture) {
      return picture ? get(picture, 'link') || DEFAULT_AVATAR : UNKNOWN_AVATAR;
    },
    toggleAuxiliarySelect () {
      return this.$refs.auxiliarySelect.show();
    },
    async getAuxiliaries () {
      try {
        this.loading = true;
        const activeAuxiliaries = await Users.listActive({
          role: [AUXILIARY, PLANNING_REFERENT],
          company: this.loggedUser.company._id,
        });
        this.auxiliaries = activeAuxiliaries.filter(aux => aux.contracts.some(c => !c.endDate));
        this.loading = false;
      } catch (e) {
        this.auxiliaries = [];
        this.loading = false;
      }
    },
    async getCustomerFollowUp () {
      try {
        this.followUpLoading = true;
        this.customerFollowUp = await Stats.getCustomerFollowUp({ customer: this.customer._id });
      } catch (e) {
        this.customerFollowUp = [];
        NotifyNegative('Erreur lors de la récupération des auxiliaires.');
      } finally {
        this.followUpLoading = false;
      }
    },
    async getCustomerFundingsMonitoring () {
      try {
        this.fundingsLoading = true;
        this.fundingsMonitoring = await Stats.getCustomerFundingsMonitoring({ customer: this.customer._id });
      } catch (e) {
        console.error(e);
        this.fundingsMonitoring = [];
        NotifyNegative('Erreur lors de la récupération du suivi des financements.');
      } finally {
        this.fundingsLoading = false;
      }
    },
    async refreshCustomer () {
      try {
        const customer = await Customers.getById(this.customer._id);
        if (!get(customer, 'referent._id')) customer.referent = { _id: '' };
        if (!get(customer, 'contact')) customer.contact = {};
        if (!get(customer, 'followUp')) customer.followUp = {};

        this.$store.commit('customer/saveCustomer', customer);
        this.isLoaded = true;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données.');
      }
    },
    saveTmp (path) {
      this.tmpInput = path === 'referent' ? get(this.customer, 'referent._id', '') : get(this.customer, path);
    },
    getPhoneLink (link) {
      return link ? `tel:+33${link.substring(1)}` : '-';
    },
    getAvatar (value) {
      const link = get(value, 'picture.link', '');
      return link || DEFAULT_AVATAR;
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .identity-block
    display: inline-block;
    font-size: 12px;
  .referent
    display: flex
  /deep/ .q-field__append
    .q-select__dropdown-icon
      display: none
</style>
