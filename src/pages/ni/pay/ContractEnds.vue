<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Fins de contrats</h4>
    </div>
    <q-table :data="draftFinalPay" :columns="columns" class="q-pa-sm large-table neutral-background" flat
      selection="multiple" row-key="auxiliaryId" :selected.sync="selected" :pagination.sync="pagination"
      :visible-columns="visibleColumns" :loading="tableLoading">
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
              <ni-editable-td :props="props.row" edited-field="overtimeHours" :value="col.value" suffix="h"
                edition-boolean-name="overtimeHoursEdition" :refName="`${props.row.auxiliaryId}Overtime`"
                @disable="disableEditionField($event)" @click="editField($event)" @change="setEditionField($event)" />
          </template>
          <template v-else-if="col.name === 'additionalHours'">
            <ni-editable-td :props="props.row" edited-field="additionalHours" suffix="h" :value="col.value"
              edition-boolean-name="additionalHoursEdition" :refName="`${props.row.auxiliaryId}Additional`"
              @disable="disableEditionField($event)" @click="editField($event)" @change="setEditionField($event)" />
          </template>
          <template v-else-if="col.name === 'bonus'">
            <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean-name="bonusEdition"
              :refName="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="€" />
          </template>
          <template v-else-if="col.name === 'compensation'">
            <ni-editable-td :props="props.row" edited-field="compensation" edition-boolean-name="compensationEdition"
              :refName="`${props.row.auxiliaryId}Compensation`" :value="col.value" suffix="€"
              @click="editField($event)" @change="setEditionField($event)" @disable="disableEditionField($event)" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <q-td>
          <q-checkbox v-model="props.selected" />
        </q-td>
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="draftFinalPay"/>
    </q-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      label="Payer" @click="createList" />

    <ni-pay-surcharge-details-modal :paySurchargeDetailsModal.sync="surchargeDetailModal"
      @update:surchargeDetailModal="resetSurchargeDetail" :surchargeDetails="surchargeDetails" />
  </q-page>
</template>

<script>
import { payMixin } from '../../../mixins/payMixin';
import { editableTdMixin } from '../../../mixins/editableTdMixin';
import EditableTd from '../../../components/table/EditableTd';
import BillingPagination from '../../../components/table/BillingPagination';
import PaySurchargeDetailsModal from '../../../components/pay/PaySurchargeDetailsModal';
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';

export default {
  name: 'ContractEnds',
  metaInfo: { title: 'Fins de contract' },
  mixins: [payMixin, editableTdMixin],
  components: {
    'ni-editable-td': EditableTd,
    'ni-billing-pagination': BillingPagination,
    'ni-pay-surcharge-details-modal': PaySurchargeDetailsModal,
  },
  data () {
    return {
      draftFinalPay: [],
      selected: [],
      pagination: { rowsPerPage: 0 },
      tableLoading: false,
      visibleColumns: ['auxiliary', 'sector', 'startDate', 'endNotificationDate', 'endReason', 'endDate', 'contractHours', 'workedHours',
        'notSurchargedAndExempt', 'surchargedAndExempt', 'notSurchargedAndNotExempt', 'surchargedAndNotExempt', 'hoursBalance', 'hoursCounter',
        'overtimeHours', 'additionalHours', 'mutual', 'transport', 'otherFees', 'bonus', 'compensation'],
      surchargeDetailModal: false,
      surchargeDetails: {},
    };
  },
  computed: {
    hasSelectedRows () {
      return this.selected.length > 0;
    },
  },
  async mounted () {
    this.tableLoading = true;
    await this.refreshFinalPay();
    this.tableLoading = false;
  },
  methods: {
    async refreshFinalPay () {
      try {
        const draftFinalPay = await this.$finalPay.getDraftFinalPay({
          startDate: this.$moment().startOf('M').toISOString(),
          endDate: this.$moment().endOf('M').toISOString(),
        });
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
    // Surcharge modal
    openSurchargeDetailModal (id, details) {
      const draft = this.draftFinalPay.find(ds => ds.auxiliary._id === id);
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
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non',
        }).onOk(async () => {
          if (!this.hasSelectedRows) return;

          const finalPayList = this.selected.map(row => this.formatPayload(row));
          await this.$finalPay.createList(finalPayList);
          NotifyPositive('Soldes tout compte créés');
          await this.refreshFinalPay();
          this.selected = [];
        });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création des soldes tout compte');
      }
    },
  },
}
</script>
