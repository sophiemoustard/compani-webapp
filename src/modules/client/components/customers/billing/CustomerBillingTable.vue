<template>
  <ni-simple-table :data="documents" :columns="columns" :loading="loading" hide-bottom :pagination="pagination">
    <template #top-row="{ props }">
      <q-tr data-cy="start-period" :props="props">
        <q-td class="bold">{{ formatDate(billingDates.startDate) }}</q-td>
        <q-td class="bold">Début de période</q-td>
        <q-td />
        <td class="bold" align="center">{{ formatPrice(startBalance) }}</td>
        <q-td />
      </q-tr>
    </template>
    <template #body="{ props }">
      <q-tr :props="props" v-if="Object.keys(documents).length > 0">
        <q-td :data-cy="`col-${col.name}`" v-for="col in props.cols" :key="col.name"
          :data-label="col.label" :props="props">
          <template v-if="col.name === 'document'">
            <template v-if="props.row.type === BILL">
              <div v-if="!props.row.number">Facture tiers</div>
              <div v-else-if="getDriveId(props.row)" :class="['download', { 'disabled': docLoading }]"
                @click="downloadDriveDoc(props.row)">
                Facture {{ props.row.number }}
              </div>
              <div v-else @click="downloadBillPdf(props.row)" :class="{ 'download': canDownload(props.row) }"
                data-cy="link">
                Facture {{ props.row.number }}
              </div>
            </template>
            <template v-else-if="props.row.type === CREDIT_NOTE">
              <div v-if="getDriveId(props.row)" :class="['download', { 'disabled': docLoading }]"
                @click="downloadDriveDoc(props.row)">
                Avoir {{ props.row.number }}
              </div>
              <div v-else @click="downloadCreditNotePdf(props.row)" :class="{ 'download': canDownload(props.row) }"
                data-cy="link">
                Avoir {{ props.row.number }}
              </div>
            </template>
            <div v-else>{{ getPaymentTitle(props.row) }}</div>
          </template>
          <template v-else-if="col.name === 'balance'">
            <q-item class="row no-wrap items-center">
              <q-item-section side>
                <q-icon data-cy="balance-icon" :name="balanceIcon(col.value)" :color="balanceIconColor(col.value)"
                  class="balance-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label data-cy="balance-amount">{{ formatBalance(col.value) }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else-if="col.name === 'actions' && displayActions">
            <ni-button v-if="paymentTypes.includes(props.row.type)" icon="edit" @click="openEditionModal(props.row)" />
            <ni-button v-if="REFUND === props.row.nature" icon="delete" @click="deleteRefund(props.row)" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </template>
    <template #bottom-row="{ props }">
      <q-tr data-cy="end-period" :props="props">
        <q-td class="bold">{{ formatDate(billingDates.endDate) }}</q-td>
        <q-td class="bold">Fin de période</q-td>
        <q-td />
        <td class="bold" align="center">{{ formatPrice(endBalance) }}</td>
        <q-td />
      </q-tr>
    </template>
  </ni-simple-table>
</template>

<script>
import get from 'lodash/get';
import Bills from '@api/Bills';
import CreditNotes from '@api/CreditNotes';
import GoogleDrive from '@api/GoogleDrive';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import { NotifyNegative } from '@components/popup/notify';
import {
  CREDIT_NOTE,
  BILL,
  BANK_TRANSFER,
  DIRECT_DEBIT,
  CHECK,
  CESU,
  CASH,
  REFUND,
  PAYMENT_OPTIONS,
  CUSTOMER,
  PAYMENT,
  COMPANI,
  MANUAL,
} from '@data/constants';
import { formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { openPdf } from '@helpers/file';

export default {
  name: 'CustomerBillingTable',
  props: {
    documents: { type: Array, default: () => [] },
    billingDates: { type: Object, default: () => ({}) },
    displayActions: { type: Boolean, default: false },
    type: { type: String, default: CUSTOMER },
    startBalance: { type: Number, default: 0 },
    endBalance: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  data () {
    return {
      docLoading: false,
      pdfLoading: false,
      CREDIT_NOTE,
      BILL,
      COMPANI,
      REFUND,
      MANUAL,
      columns: [
        { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
        { name: 'document', label: '', align: 'left' },
        {
          name: 'inclTaxes',
          label: 'Montant TTC',
          align: 'center',
          field: row => this.getInclTaxes(row),
          format: formatPrice,
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'center',
          field: 'balance',
          style: 'width: 100px',
          format: formatPrice,
        },
        { name: 'actions', label: '', align: 'left', style: 'width: 100px' },
      ],
      pagination: { rowsPerPage: 0 },
      paymentTypes: PAYMENT_OPTIONS.map(op => op.value),
    };
  },
  methods: {
    balanceIconColor (val) {
      return this.isZero(val) || !this.isNegative(val) ? 'copper-grey-400' : 'secondary';
    },
    balanceIcon (val) {
      return this.isZero(val) || !this.isNegative(val) ? 'mdi-plus-circle-outline' : 'mdi-minus-circle-outline';
    },
    formatBalance (val) {
      if (this.isNegative(val)) return val.substring(1);
      return val;
    },
    getPaymentTitle (payment) {
      const titlePrefix = payment.nature === PAYMENT
        ? `Paiement ${payment.number}`
        : `Remboursement ${payment.number}`;
      const paymentOption = PAYMENT_OPTIONS.find(opt => opt.value === payment.type);
      const typeLabel = paymentOption ? ` (${paymentOption.label})` : '';
      return `${titlePrefix}${typeLabel}`;
    },
    formatDate (value) {
      return formatDate(value);
    },
    formatPrice (value) {
      return formatPrice(value);
    },
    isZero (val) {
      return Number.parseFloat(val) === 0;
    },
    isNegative (val) {
      return val[0] === '-';
    },
    getInclTaxes (doc) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return this.type === CUSTOMER ? doc.inclTaxesCustomer : doc.inclTaxesTpp;
        case BANK_TRANSFER:
        case DIRECT_DEBIT:
        case CHECK:
        case CASH:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    openEditionModal (payment) {
      this.$emit('open-edition-modal', payment);
    },
    getDriveId (doc) {
      return get(doc, 'driveFile.driveId') || '';
    },
    async downloadDriveDoc (doc) {
      if (this.docLoading) return;
      try {
        this.docLoading = true;
        await GoogleDrive.downloadFileById(this.getDriveId(doc));
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
      }
    },
    canDownload (doc) {
      return doc.origin === COMPANI;
    },
    async downloadBillPdf (bill) {
      if (this.pdfLoading) return;
      if (!this.canDownload(bill)) return;

      try {
        this.pdfLoading = true;
        const pdf = await Bills.getPdf(bill._id);
        openPdf(pdf);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la facture');
      } finally {
        this.pdfLoading = false;
      }
    },
    async downloadCreditNotePdf (cn) {
      if (this.pdfLoading) return;
      if (!this.canDownload(cn)) return;

      try {
        this.pdfLoading = true;
        const pdf = await CreditNotes.getPdf(cn._id);
        openPdf(pdf);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de l\'avoir');
      } finally {
        this.pdfLoading = false;
      }
    },
    deleteRefund (refund) {
      this.$emit('delete', refund);
    },
  },
};
</script>

<style lang="sass" scoped>
  .bold
    font-weight: bold

  .q-table tbody tr:hover
    background: none

  .download
    cursor: pointer
    color: $primary
    text-decoration: underline

  .disabled
    cursor: not-allowed

  ::v-deep .q-item
    .q-item__section
      padding: 0px

</style>
