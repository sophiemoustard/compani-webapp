<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="À payer">
      <template slot="title">
        <q-btn round flat icon="save_alt" @click="exportToCSV" color="primary" style="margin-left: 5px"
          :disable="displayedDraftPay.length === 0" />
      </template>
      <template slot="content">
        <div class=" col-xs-12 row items-baseline justify-end fill-width">
          <div>Trier par</div>
          <div class="col-xs-12 col-sm-6 col-md-3">
            <ni-select class="q-pl-sm" :options="sortOptions" v-model="sortOption" separator />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-4">
            <ni-select-sector class="q-pl-sm" v-model="selectedSector" allow-null-option />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-3">
            <ni-select class="q-pl-sm" :options="periodOptions" v-model="period" separator />
          </div>
        </div>
      </template>
    </ni-title-header>
    <q-table :data="displayedDraftPay" :columns="columns" class="q-pa-sm large-table" selection="multiple"
      row-key="auxiliaryId" :selected.sync="selected" :pagination.sync="sortedPagination" :loading="tableLoading"
      :visible-columns="visibleColumns" card-class="neutral-background" flat>
      <q-tr slot="header" slot-scope="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        <th>
          <q-checkbox v-model="props.selected" indeterminate-value="some" />
        </th>
      </q-tr>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'surchargedAndExempt'">
            <div v-if="props.row.surchargedAndExempt" class="cursor-pointer text-primary"
              @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndExemptDetails')">
              {{ col.value }}
            </div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'surchargedAndNotExempt'">
            <div v-if="props.row.surchargedAndNotExempt" class="cursor-pointer text-primary"
              @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndNotExemptDetails')">
              {{ col.value }}
            </div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'hoursCounter'">
            <ni-editable-td :props="props.row" edited-field="hoursCounter" edition-boolean-name="hoursCounterEdition"
              :refName="`${props.row.auxiliaryId}Counter`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'overtimeHours'">
            <ni-editable-td :props="props.row" edited-field="overtimeHours" edition-boolean-name="overtimeHoursEdition"
              :refName="`${props.row.auxiliaryId}Overtime`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'additionalHours'">
            <ni-editable-td :props="props.row" edited-field="additionalHours"
              edition-boolean-name="additionalHoursEdition" :refName="`${props.row.auxiliaryId}Additional`"
              :value="col.value" @disable="disableEditionField($event)" @click="editField($event)"
              @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'bonus'">
            <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean-name="bonusEdition"
              :refName="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="€" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <q-td>
          <q-checkbox v-model="props.selected" />
        </q-td>
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="sortedPagination"
        :data="displayedDraftPay" />
    </q-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      label="Payer" @click="createList" />

    <ni-pay-surcharge-details-modal :paySurchargeDetailsModal.sync="surchargeDetailModal"
      @update:surchargeDetailModal="resetSurchargeDetail" :surchargeDetails="surchargeDetails">
    </ni-pay-surcharge-details-modal>
  </q-page>
</template>

<script>
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import Select from '../../../components/form/Select';
import SelectSector from '../../../components/form/SelectSector';
import EditableTd from '../../../components/table/EditableTd';
import BillingPagination from '../../../components/table/BillingPagination';
import PaySurchargeDetailsModal from '../../../components/pay/PaySurchargeDetailsModal';
import TitleHeader from '../../../components/TitleHeader';
import { payMixin } from '../../../mixins/payMixin';
import { editableTdMixin } from '../../../mixins/editableTdMixin';

export default {
  name: 'ToPay',
  metaInfo: { title: 'Paie mensuelle' },
  mixins: [payMixin, editableTdMixin],
  components: {
    'ni-select': Select,
    'ni-select-sector': SelectSector,
    'ni-editable-td': EditableTd,
    'ni-billing-pagination': BillingPagination,
    'ni-pay-surcharge-details-modal': PaySurchargeDetailsModal,
    'ni-title-header': TitleHeader,
  },
  data () {
    return {
      draftPay: [],
      selected: [],
      pagination: { rowsPerPage: 0 },
      visibleColumns: ['auxiliary', 'sector', 'startDate', 'endDate', 'contractHours', 'workedHours', 'notSurchargedAndExempt', 'surchargedAndExempt',
        'notSurchargedAndNotExempt', 'surchargedAndNotExempt', 'hoursBalance', 'hoursCounter', 'overtimeHours', 'additionalHours', 'mutual', 'transport',
        'otherFees', 'bonus'],
      surchargeDetailModal: false,
      surchargeDetails: {},
      selectedSector: '',
      tableLoading: false,
      sortOptions: [
        { label: 'Auxiliaire', value: 'auxiliary' },
        { label: 'Équipe', value: 'sector' },
        { label: 'Début', value: 'startDate' },
        { label: 'Heures contrat', value: 'contractHours' },
        { label: 'Heures travaillées', value: 'workedHours' },
        { label: 'Solde heures', value: 'hoursBalance' },
        { label: 'Compteur', value: 'hoursCounter' },
        { label: 'Mutuelle', value: 'mutual' },
        { label: 'Transport', value: 'transport' },
        { label: 'Autres frais', value: 'otherFees' },
      ],
      period: 1,
      periodOptions: [
        { label: 'Mois en cours', value: 1 },
        { label: 'Mois précédent', value: 0 },
      ],
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      sortOption: 'auxiliary',
    };
  },
  computed: {
    hasSelectedRows () {
      return this.selected.length > 0;
    },
    sortedPagination: {
      get () {
        return { ...this.pagination, sortBy: this.sortOption, ascending: true };
      },
      set (newVal) {
        return newVal;
      },
    },
    displayedDraftPay () {
      if (this.selectedSector === '') return [...this.draftPay];
      return this.draftPay.filter(dp => dp.auxiliary.sector._id === this.selectedSector);
    },
  },
  watch: {
    selectedSector (value) {
      this.selected = [];
    },
    async period (value) {
      this.selected = [];
      if (value) {
        this.dates = {
          startDate: this.$moment().startOf('M').toISOString(),
          endDate: this.$moment().endOf('M').toISOString(),
        }
      } else {
        this.dates = {
          startDate: this.$moment().subtract(1, 'M').startOf('M').toISOString(),
          endDate: this.$moment().subtract(1, 'M').endOf('M').toISOString(),
        }
      }
      await this.refreshDraftPay();
    },
  },
  async mounted () {
    await this.refreshDraftPay();
  },
  methods: {
    async refreshDraftPay () {
      try {
        this.tableLoading = true;
        this.draftPay = [];

        const draftPay = await this.$pay.getDraftPay(this.dates);
        this.draftPay = draftPay.map(dp => ({
          ...dp,
          hoursCounterEdition: false,
          overtimeHoursEdition: false,
          additionalHoursEdition: false,
          bonusEdition: false,
        }));
      } catch (e) {
        NotifyNegative('Impossible de récupérer les payes');
        this.draftPay = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    // Surcharge modal
    openSurchargeDetailModal (id, details) {
      const draft = this.draftPay.find(dp => dp.auxiliary._id === id);
      if (!draft) return;

      this.surchargeDetails = draft[details];
      this.surchargeDetailModal = true;
    },
    resetSurchargeDetail () {
      this.surchargeDetails = {};
    },
    // Creation
    async createList () {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non',
        }).onOk(async () => {
          if (!this.hasSelectedRows) return;

          const pay = this.selected.map(row => this.formatPayload(row));
          await this.$pay.createList(pay);

          NotifyPositive('Fiches de paie crées');
          await this.refreshDraftPay();
          this.selected = [];
        }).onCancel(() => NotifyPositive('Création annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création des fiches de paie');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @media screen and (max-width: 767px)
    .responsive
      &-margin-bottom
        margin-bottom: 5px
      &-sort
        width: 100%
</style>
