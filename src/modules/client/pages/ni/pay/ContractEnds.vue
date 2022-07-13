<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Fin de contrats" padding>
      <template #content>
        <div class="header-selects">
          <div class="row header-selects-container">
            <div class="col-xs-12">
              <ni-select :options="periodOptions" v-model="period" caption="Période" />
            </div>
          </div>
        </div>
      </template>
    </ni-title-header>
    <div class="q-mx-md">
      <ni-button icon="save_alt" color="primary" @click="exportTxt(CONTRACT_END)" label="Données fin de contrats" />
    </div>
    <ni-simple-table :data="draftFinalPay" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      row-key="auxiliaryId" selection="multiple" v-model:selected="selected">
      <template #header="{ props }">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :style="col.style" :key="col.name" :props="props">{{ col.label }}</q-th>
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
              <div v-if="shouldDisplayDetails(props.row.auxiliary._id, 'surchargedAndExemptDetails', draftFinalPay)"
                class="cursor-pointer text-primary"
                @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndExemptDetails', draftFinalPay)">
                {{ col.value }}
              </div>
              <div v-else>{{ col.value }}</div>
            </template>
            <template v-else-if="col.name === 'surchargedAndNotExempt'">
              <div v-if="shouldDisplayDetails(props.row.auxiliary._id, 'surchargedAndNotExemptDetails', draftFinalPay)"
                class="cursor-pointer text-primary" @click="openSurchargeDetailModal(
                  props.row.auxiliary._id,
                  'surchargedAndNotExemptDetails',
                  draftFinalPay
                )">
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
                  @disable="disableEditionField($event)" @click="editField($event)" @change="setEditionField($event)" />
            </template>
            <template v-else-if="col.name === 'additionalHours'">
              <ni-editable-td :props="props.row" edited-field="additionalHours" suffix="h" :value="col.value"
                edition-boolean-name="additionalHoursEdition" :ref-name="`${props.row.auxiliaryId}Additional`"
                @disable="disableEditionField($event)" @click="editField($event)" @change="setEditionField($event)" />
            </template>
            <template v-else-if="col.name === 'bonus'">
              <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean-name="bonusEdition"
                :ref-name="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
                @click="editField($event)" @change="setEditionField($event)" suffix="€" />
            </template>
            <template v-else-if="col.name === 'compensation'">
              <ni-editable-td :props="props.row" edited-field="compensation" edition-boolean-name="compensationEdition"
                :ref-name="`${props.row.auxiliaryId}Compensation`" :value="col.value" suffix="€"
                @click="editField($event)" @change="setEditionField($event)" @disable="disableEditionField($event)" />
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
      label="Payer" @click="validateFinalPayListCreation" />

    <ni-pay-surcharge-details-modal v-model:pay-surcharge-details-modal="surchargeDetailModal"
      @update:surcharge-detail-modal="resetSurchargeDetail" :pay="pay" :surcharge-detail-key="surchargeDetailKey" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import FinalPay from '@api/FinalPay';
import Button from '@components/Button';
import EditableTd from '@components/table/EditableTd';
import SimpleTable from '@components/table/SimpleTable';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { CONTRACT_END } from '@data/constants';
import { payMixin } from 'src/modules/client/mixins/payMixin';
import { editableTdMixin } from 'src/modules/client/mixins/editableTdMixin';
import PaySurchargeDetailsModal from 'src/modules/client/components/pay/PaySurchargeDetailsModal';

const metaInfo = { title: 'Fins de contract' };

export default {
  name: 'ContractEnds',
  mixins: [payMixin, editableTdMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-editable-td': EditableTd,
    'ni-simple-table': SimpleTable,
    'ni-pay-surcharge-details-modal': PaySurchargeDetailsModal,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-button': Button,
  },
  data () {
    return {
      draftFinalPay: [],
      selected: [],
      pagination: { rowsPerPage: 0 },
      tableLoading: false,
      surchargeDetailModal: false,
      surchargeDetails: {},
      CONTRACT_END,
    };
  },
  computed: {
    hasSelectedRows () {
      return this.selected.length > 0;
    },
  },
  watch: {
    async period (value) {
      this.selected = [];
      this.setSelectedPeriod(value);
      await this.refreshFinalPay();
    },
  },
  async created () {
    this.tableLoading = true;
    await this.refreshFinalPay();
    this.tableLoading = false;
  },
  methods: {
    async refreshFinalPay () {
      try {
        const draftFinalPay = await FinalPay.getDraftFinalPay(this.dates);
        this.draftFinalPay = draftFinalPay.map(dp => ({
          ...dp,
          hoursCounterEdition: false,
          overtimeHoursEdition: false,
          additionalHoursEdition: false,
          bonusEdition: false,
          compensationEdition: false,
        }));
      } catch (e) {
        this.draftFinalPay = [];
        console.error(e);
      }
    },
    validateFinalPayListCreation () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous ?',
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(this.createList)
        .onCancel(() => NotifyPositive('Création annulée'));
    },
    async createList () {
      try {
        if (!this.hasSelectedRows) return;

        const finalPayList = this.selected.map(row => this.formatPayload(row));
        await FinalPay.createList(finalPayList);
        NotifyPositive('Soldes tout compte créés');
        await this.refreshFinalPay();
        this.selected = [];
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création des soldes tout compte.');
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.selects
  justify-content: end
  &-container
    align-items: end
</style>
