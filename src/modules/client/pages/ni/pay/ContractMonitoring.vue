<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Suivi Contrats/Avenants" padding>
      <template #content>
        <div class="col-xs-12 col-md-6">
          <ni-date-range v-model="dates" @blur="refreshContracts" borderless v-model:error="datesHasError" />
        </div>
      </template>
    </ni-title-header>
    <ni-simple-table :data="versionsList" :columns="columns" v-model:pagination="pagination" row-key="name"
      :loading="contractsLoading">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions contract-actions">
                <ni-button icon="remove_red_eye" @click="goToUserContractPage(col.value)" />
                <ni-button icon="edit" @click="openVersionEditionModal(props.row)" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>

    <!-- Edition modal -->
    <version-edition-modal v-model="versionEditionModal" v-model:edited-version="editedVersion" :loading="loading"
      :validations="v$.editedVersion" :min-start-date="editedVersionMinStartDate" @hide="resetVersionEditionModal"
      @submit="editVersion" :gross-hourly-rate-error="grossHourlyRateError(v$.editedVersion)"
      :start-date-error="startDateError(v$.editedVersion)" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required, minValue } from '@vuelidate/validators';
import get from 'lodash/get';
import Contracts from '@api/Contracts';
import Button from '@components/Button';
import DateRange from '@components/form/DateRange';
import TitleHeader from '@components/TitleHeader';
import SimpleTable from '@components/table/SimpleTable';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import { minDate } from '@helpers/vuelidateCustomVal';
import { contractMixin } from 'src/modules/client/mixins/contractMixin';
import VersionEditionModal from 'src/modules/client/components/contracts/VersionEditionModal';

export default {
  name: 'ContractMonitoring',
  mixins: [contractMixin],
  components: {
    'ni-button': Button,
    'ni-date-range': DateRange,
    'ni-title-header': TitleHeader,
    'version-edition-modal': VersionEditionModal,
    'ni-simple-table': SimpleTable,
  },
  setup () {
    const metaInfo = { title: 'Suivi Contrats/Avenants' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  data () {
    return {
      dates: {
        startDate: moment().startOf('M').toISOString(),
        endDate: moment().endOf('M').toISOString(),
      },
      auxiliary: {},
      contractsList: [],
      versionsList: [],
      datesHasError: false,
      contractsLoading: false,
      pagination: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          field: row => formatIdentity(row.user.identity, 'LF'),
          align: 'left',
          sortable: true,
        },
        {
          name: 'team',
          label: 'Equipe',
          align: 'left',
          field: row => get(row, 'user.sector.name', ''),
          sortable: true,
        },
        { name: 'type', label: 'Nature', field: 'type', align: 'left', sortable: true },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          format: value => moment(value).format('DD/MM/YYYY'),
          align: 'center',
          sortable: true,
        },
        { name: 'weeklyHours', label: 'Nombre d\'heures', field: 'weeklyHours', align: 'center', sortable: true },
        { name: 'grossHourlyRate', label: 'Taux horaire', field: 'grossHourlyRate', align: 'center', sortable: true },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: value => (value ? moment(value).format('DD/MM/YYYY') : '∞'),
          align: 'center',
          sortable: true,
        },
        { name: 'actions', align: 'center', field: 'user' },
      ],
    };
  },
  validations () {
    return {
      editedVersion: {
        grossHourlyRate: { required, minValue: minValue(0) },
        startDate: { required, minDate: this.editedVersionMinStartDate ? minDate(this.editedVersionMinStartDate) : '' },
      },
    };
  },
  async created () {
    await this.refreshContracts();
  },
  methods: {
    async refreshContracts () {
      try {
        this.contractsLoading = true;
        if (this.datesHasError) return;
        this.contractsList = await Contracts.list({ startDate: this.dates.startDate, endDate: this.dates.endDate });
        this.formatContractList();
        this.contractsLoading = false;
      } catch (e) {
        this.versionsList = [];
        this.contractsLoading = false;
        console.error(e);
      }
    },
    // Contract edition
    openVersionEditionModal (version) {
      this.editedVersion = {
        contractId: version.contractId,
        versionId: version._id,
        grossHourlyRate: version.grossHourlyRate,
        startDate: version.startDate,
        shouldBeSigned: !!version.signature && !!version.signature.eversignId,
      };
      this.selectedContract = this.contractsList.find(contract => contract._id === version.contractId);
      this.selectedVersion = version;
      this.versionEditionModal = true;
      this.auxiliary = version.user;
    },
    formatContractList () {
      const startDate = moment(this.dates.startDate);
      const endDate = moment(this.dates.endDate);
      this.versionsList = [];

      this.contractsList.forEach((contract) => {
        const { versions } = contract;
        for (let idx = 0; idx < versions.length; idx++) {
          const version = versions[idx];
          const versionStartDate = moment(version.startDate);
          let isInInterval = versionStartDate.isBetween(startDate, endDate, 'day', '[]');
          let contractType = idx ? 'Avenant' : 'Contrat';
          if (idx === versions.length - 1 && version.endDate) {
            const versionEndDate = moment(version.endDate);
            const isEndDateInInterval = versionEndDate.isBetween(startDate, endDate, 'day', '[]');
            if (isEndDateInInterval) {
              isInInterval = true;
              contractType = 'Contract';
            }
          }
          if (isInInterval) {
            const versionToDisplay = { ...version, contractId: contract._id, user: contract.user, type: contractType };
            this.versionsList.push(versionToDisplay);
          }
        }
      });
    },
    goToUserContractPage (user) {
      this.$router.push({
        name: 'ni auxiliaries info',
        params: { auxiliaryId: user._id },
        query: { defaultTab: 'contracts' },
      });
    },
  },
};
</script>
