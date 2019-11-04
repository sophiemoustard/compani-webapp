<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="Suivi Contrats/Avenants">
      <template slot="content">
        <div class="col-xs-12 col-md-6">
          <ni-date-range v-model="dates" @input="refreshContracts" borderless :error.sync="datesHasError" />
        </div>
      </template>
    </ni-title-header>
    <ni-large-table :data="versionsList" :columns="columns" :pagination.sync="pagination" row-key="name">
      <template v-slot:body-cell="props">
        <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name">
          <template v-if="col.name === 'actions'">
            <div class="row no-wrap table-actions contract-actions">
              <q-btn flat round small color="grey" icon="remove_red_eye" @click="goToUserContractPage(col.value)" />
              <q-btn flat round small color="grey" icon="edit" @click="openVersionEditionModal(props.row)" />
            </div>
          </template>
          <template v-else>
            {{ col.value }}
          </template>
        </q-td>
      </template>
    </ni-large-table>

    <!-- Edition modal -->
    <version-edition-modal v-model="versionEditionModal" :editedVersion="editedVersion" :loading="loading"
      :validations="$v.editedVersion" :minStartDate="editedVersionMinStartDate" :isVersionUpdated="isVersionUpdated"
      @hide="resetVersionEditionModal" @editVersion="editVersion"/>

  </q-page>
</template>

<script>
import DateRange from '../../../components/form/DateRange';
import TitleHeader from '../../../components/TitleHeader';
import LargeTable from '../../../components/table/LargeTable';
import { formatIdentity } from '../../../helpers/utils';
import { contractMixin } from '../../../mixins/contractMixin.js';
import VersionEditionModal from '../../../components/contracts/VersionEditionModal.vue';

export default {
  name: 'ContractMonitoring',
  metaInfo: {
    title: 'Suivi Contrats/Avenants',
  },
  mixins: [contractMixin],
  components: {
    'ni-date-range': DateRange,
    'ni-title-header': TitleHeader,
    'version-edition-modal': VersionEditionModal,
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      getUser: {},
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
          field: row => this.$_.get(row, 'user.sector.name', ''),
          sortable: true,
        },
        {
          name: 'type',
          label: 'Nature',
          field: 'type',
          align: 'left',
          sortable: true,
        },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
          sortable: true,
        },
        {
          name: 'weeklyHours',
          label: 'Nombre d\'heures',
          field: 'weeklyHours',
          align: 'center',
          sortable: true,
        },
        {
          name: 'grossHourlyRate',
          label: 'Taux horaire',
          field: 'grossHourlyRate',
          align: 'center',
          sortable: true,
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '∞',
          align: 'center',
          sortable: true,
        },
        {
          name: 'actions',
          align: 'center',
          field: 'user',
        },
      ],
    }
  },
  async mounted () {
    await this.refreshContracts();
  },
  computed: {
    mainUser () {
      return this.$store.getters['main/user'];
    },
    userCompany () {
      return this.mainUser.company;
    },
  },
  methods: {
    async refreshContracts () {
      try {
        this.contractsLoading = true;
        if (this.datesHasError) return;
        this.contractsList = await this.$contracts.list({ startDate: this.dates.startDate, endDate: this.dates.endDate });
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
      this.getUser = version.user;
    },
    formatContractList () {
      const startDate = this.$moment(this.dates.startDate);
      const endDate = this.$moment(this.dates.endDate);
      this.versionsList = [];

      this.contractsList.forEach(contract => {
        const { versions } = contract;
        for (let idx = 0; idx < versions.length; idx++) {
          const version = versions[idx];
          const versionStartDate = this.$moment(version.startDate);
          let isInInterval = versionStartDate.isBetween(startDate, endDate, 'day', '[]');
          let contractType = idx ? 'Avenant' : 'Contrat';
          if (idx === versions.length - 1 && version.endDate) {
            const versionEndDate = this.$moment(version.endDate);
            const isEndDateInInterval = versionEndDate.isBetween(startDate, endDate, 'day', '[]');
            if (isEndDateInInterval) {
              isInInterval = true;
              contractType = 'Contract';
            }
          }
          if (isInInterval) {
            const versionToDisplay = {
              ...version,
              contractId: contract._id,
              user: contract.user,
              type: contractType,
            }
            this.versionsList.push(versionToDisplay);
          }
        }
      });
    },
    goToUserContractPage (user) {
      this.$router.push({ name: 'personal info', params: { id: user._id, defaultTab: 'contracts' } });
    },
  },
}
</script>
