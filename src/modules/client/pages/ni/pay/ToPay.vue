<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Paie mensuelle" padding>
      <template #title>
        <ni-button icon="save_alt" @click="exportToCSV" :disable="displayedDraftPay.length === 0" class="q-ml-sm" />
      </template>
      <template #content>
        <div class="header-selects">
          <div class="row header-selects-container">
            <div class="col-xs-12 col-sm-4">
              <ni-select class="q-ma-sm" :options="sortOptions" v-model="sortOption" caption="Trier par" />
            </div>
            <div class="col-xs-12 col-sm-4">
              <ni-select-sector class="q-ma-sm" v-model="selectedSector" allow-null-option />
            </div>
            <div class="col-xs-12 col-sm-4">
              <ni-select class="q-ma-sm" :options="periodOptions" v-model="period" caption="Période" />
            </div>
          </div>
        </div>
      </template>
    </ni-title-header>
    <div class="q-mx-md">
      <ni-button icon="save_alt" color="primary" @click="exportTxt(IDENTIFICATION)" label="Données d'identification" />
      <ni-button icon="save_alt" color="primary" @click="exportTxt(CONTRACT_VERSION)" label="Données avenants" />
      <ni-button icon="save_alt" color="primary" @click="exportTxt(ABSENCE)" label="Données absences" />
      <ni-button icon="save_alt" color="primary" @click="exportTxt(PAY)" label="Données paie" />
    </div>
    <ni-simple-table :data="displayedDraftPay" :columns="columns" selection="multiple" row-key="auxiliaryId"
      v-model:selected="selected" v-model:pagination="pagination" :loading="tableLoading"
      :visible-columns="visibleColumns">
      <template #header="{ props }">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
          <th>
            <q-checkbox v-model="props.selected" indeterminate-value="some" dense />
          </th>
        </q-tr>
      </template>
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
            <template v-if="col.name === 'surchargedAndExempt'">
              <div v-if="shouldDisplayDetails(props.row.auxiliary._id, 'surchargedAndExemptDetails', draftPay)"
                class="cursor-pointer text-primary"
                @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndExemptDetails', draftPay)">
                {{ col.value }}
              </div>
              <div v-else>{{ col.value }}</div>
            </template>
            <template v-else-if="col.name === 'surchargedAndNotExempt'">
              <div v-if="shouldDisplayDetails(props.row.auxiliary._id, 'surchargedAndNotExemptDetails', draftPay)"
                class="cursor-pointer text-primary"
                @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndNotExemptDetails', draftPay)">
                {{ col.value }}
              </div>
              <div v-else>{{ col.value }}</div>
            </template>
            <template v-else-if="col.name === 'hoursCounter'">
              <ni-editable-td :props="props.row" edited-field="hoursCounter" edition-boolean-name="hoursCounterEdition"
                :ref-name="`${props.row.auxiliaryId}Counter`" :value="col.value" @disable="disableEditionField($event)"
                @click="editField($event)" @change="setEditionField($event)" suffix="h" />
            </template>
            <template v-else-if="col.name === 'overtimeHours'">
              <ni-editable-td :props="props.row" edited-field="overtimeHours" :value="col.value" suffix="h"
                edition-boolean-name="overtimeHoursEdition" :ref-name="`${props.row.auxiliaryId}Overtime`"
                @click="editField($event)" @change="setEditionField($event)" @disable="disableEditionField($event)" />
            </template>
            <template v-else-if="col.name === 'additionalHours'">
              <ni-editable-td :props="props.row" edited-field="additionalHours"
                edition-boolean-name="additionalHoursEdition" :ref-name="`${props.row.auxiliaryId}Additional`"
                :value="col.value" @disable="disableEditionField($event)" @click="editField($event)"
                @change="setEditionField($event)" suffix="h" />
            </template>
            <template v-else-if="col.name === 'bonus'">
              <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean-name="bonusEdition"
                :ref-name="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
                @click="editField($event)" @change="setEditionField($event)" suffix="€" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
          <q-td>
            <q-checkbox v-model="props.selected" dense />
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      label="Payer" @click="validateCreation" />

    <ni-pay-surcharge-details-modal v-model="surchargeDetailModal"
      @update:surcharge-detail-modal="resetSurchargeDetail" :pay="pay" :surcharge-detail-key="surchargeDetailKey" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import get from 'lodash/get';
import Pay from '@api/Pay';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Button from '@components/Button';
import Select from '@components/form/Select';
import SelectSector from '@components/form/SelectSector';
import TitleHeader from '@components/TitleHeader';
import SimpleTable from '@components/table/SimpleTable';
import EditableTd from '@components/table/EditableTd';
import { IDENTIFICATION, ABSENCE, CONTRACT_VERSION, PAY } from '@data/constants';
import PaySurchargeDetailsModal from 'src/modules/client/components/pay/PaySurchargeDetailsModal';
import { payMixin } from 'src/modules/client/mixins/payMixin';
import { editableTdMixin } from 'src/modules/client/mixins/editableTdMixin';

const metaInfo = { title: 'Paie mensuelle' };

export default {
  name: 'ToPay',
  mixins: [payMixin, editableTdMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-select': Select,
    'ni-select-sector': SelectSector,
    'ni-editable-td': EditableTd,
    'ni-pay-surcharge-details-modal': PaySurchargeDetailsModal,
    'ni-title-header': TitleHeader,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  data () {
    return {
      draftPay: [],
      selected: [],
      pagination: { rowsPerPage: 0, ascending: true },
      visibleColumns: [
        'auxiliary',
        'sector',
        'startDate',
        'endDate',
        'contractHours',
        'absencesHours',
        'hoursToWork',
        'workedHours',
        'notSurchargedAndExempt',
        'surchargedAndExempt',
        'notSurchargedAndNotExempt',
        'surchargedAndNotExempt',
        'paidTransportHours',
        'diff',
        'hoursBalance',
        'previousMonthHoursCounter',
        'hoursCounter',
        'overtimeHours',
        'additionalHours',
        'mutual',
        'transport',
        'phoneFees',
        'bonus',
      ],
      surchargeDetailModal: false,
      selectedSector: '',
      tableLoading: false,
      sortOptions: [
        { label: 'Auxiliaire', value: 'auxiliary', path: 'auxiliary.identity.lastname' },
        { label: 'Équipe', value: 'sector', path: 'auxiliary.sector.name' },
        { label: 'Début', value: 'startDate', path: 'startDate' },
        { label: 'Heures contrat', value: 'contractHours', path: 'contractHours' },
        { label: 'Heures d\'absences', value: 'absencesHours', path: 'absencesHours' },
        { label: 'Heures travaillées', value: 'workedHours', path: 'workedHours' },
        { label: 'Temps de transport', value: 'paidTransportHours', path: 'paidTransportHours' },
        { label: 'Solde heures', value: 'hoursBalance', path: 'hoursBalance' },
        { label: 'Compteur', value: 'hoursCounter', path: 'hoursCounter' },
        { label: 'Mutuelle', value: 'mutual', path: 'mutual' },
        { label: 'Transport', value: 'transport', path: 'transport' },
        { label: 'Frais téléphoniques', value: 'phoneFees', path: 'phoneFees' },
      ],
      sortOption: 'auxiliary',
      IDENTIFICATION,
      CONTRACT_VERSION,
      ABSENCE,
      PAY,
    };
  },
  computed: {
    hasSelectedRows () {
      return this.selected.length > 0;
    },
    displayedDraftPay () {
      const draftPayList = this.selectedSector === ''
        ? [...this.draftPay]
        : this.draftPay.filter(dp => dp.auxiliary.sector._id === this.selectedSector);

      if (!this.sortOption) return draftPayList;

      const option = this.sortOptions.find(op => op.value === this.sortOption);

      return draftPayList.sort((dp1, dp2) => {
        if (get(dp1, option.path) === get(dp2, option.path)) return 0;

        if (option === this.sortOptions[0] || option === this.sortOptions[1]) {
          return (get(dp1, option.path) < get(dp2, option.path)) ? -1 : 1;
        }

        return (get(dp1, option.path) < get(dp2, option.path)) ? 1 : -1;
      });
    },
  },
  watch: {
    sortBy (value) {
      this.pagination = { ...this.pagination, sortBy: value };
    },
    selectedSector (value) {
      this.selected = [];
    },
    async period (value) {
      this.selected = [];
      this.setSelectedPeriod(value);
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

        const draftPay = await Pay.getDraftPay(this.dates);
        this.draftPay = draftPay.map(dp => ({
          ...dp,
          hoursCounterEdition: false,
          overtimeHoursEdition: false,
          additionalHoursEdition: false,
          bonusEdition: false,
        }));
      } catch (e) {
        NotifyNegative('Impossible de récupérer les payes.');
        this.draftPay = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    validateCreation () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous&nbsp;?',
        html: true,
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(() => this.createList())
        .onCancel(() => NotifyPositive('Création annulée.'));
    },
    async createList () {
      try {
        if (!this.hasSelectedRows) return;

        const pay = this.selected.map(row => this.formatPayload(row));
        await Pay.createList(pay);

        NotifyPositive('Fiches de paie crées');
        await this.refreshDraftPay();
        this.selected = [];
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création des fiches de paie.');
      }
    },
  },
};
</script>
