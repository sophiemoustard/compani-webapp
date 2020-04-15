<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Fins de contrats</h4>
    </div>
    <ni-large-table :data="draftFinalPay" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      row-key="auxiliaryId" selection="multiple" :selected.sync="selected">
      <template v-slot:header="{ props }" >
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :style="col.style" :key="col.name" :props="props">{{ col.label }}</q-th>
          <th>
            <q-checkbox v-model="props.selected" indeterminate-value="some" dense />
          </th>
        </q-tr>
      </template>
      <template v-slot:body="{ props }" >
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
            :style="col.style">
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
            <q-checkbox v-model="props.selected" dense />
          </q-td>
        </q-tr>
      </template>
    </ni-large-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      label="Payer" @click="validateFinalPayListCreation" />

    <ni-pay-surcharge-details-modal :paySurchargeDetailsModal.sync="surchargeDetailModal"
      @update:surchargeDetailModal="resetSurchargeDetail" :pay="pay" :surchargeDetailKey="surchargeDetailKey" />
  </q-page>
</template>

<script>
import FinalPay from '@api/FinalPay';
import EditableTd from '@components/table/EditableTd';
import LargeTable from '@components/table/LargeTable';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { payMixin } from 'src/modules/client/mixins/payMixin';
import { editableTdMixin } from 'src/modules/client/mixins/editableTdMixin';
import PaySurchargeDetailsModal from 'src/modules/client/components/pay/PaySurchargeDetailsModal';

export default {
  name: 'ContractEnds',
  metaInfo: { title: 'Fins de contract' },
  mixins: [payMixin, editableTdMixin],
  components: {
    'ni-editable-td': EditableTd,
    'ni-large-table': LargeTable,
    'ni-pay-surcharge-details-modal': PaySurchargeDetailsModal,
  },
  data () {
    return {
      draftFinalPay: [],
      selected: [],
      pagination: { rowsPerPage: 0 },
      tableLoading: false,
      surchargeDetailModal: false,
      surchargeDetails: {},
      pay: {},
      surchargeDetailKey: '',
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
        const draftFinalPay = await FinalPay.getDraftFinalPay({
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

      this.pay = draft;
      this.surchargeDetailKey = details;
      this.surchargeDetailModal = true;
    },
    resetSurchargeDetail () {
      this.pay = {};
      this.surchargeDetailKey = '';
    },
    // Creation
    validateFinalPayListCreation () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous ?',
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
}
</script>
