<template>
  <ni-simple-table :data="documents" :columns="columns">
    <template v-slot:top-row="{ props }" >
      <q-tr :props="props">
        <q-td class="bold">{{ formatDate(billingDates.startDate) }}</q-td>
        <q-td class="bold">Début de période</q-td>
        <q-td />
        <td class="bold" align="center">{{ formatPrice(startBalance) }}</td>
        <q-td />
      </q-tr>
    </template>
    <template v-slot:body="{ props }">
      <q-tr :props="props" v-if="Object.keys(documents).length > 0">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'document'">
            <template v-if="props.row.type === BILL">
              <template v-if="props.row.number">
                <a v-if="canDownloadBill(props.row)" :href="billUrl(props.row)" target="_blank" class="download">
                  Facture {{ props.row.number }}
                </a>
                <div v-else>Facture {{ props.row.number }}</div>
              </template>
              <div v-else>Facture tiers</div>
            </template>
            <template  v-else-if="props.row.type === CREDIT_NOTE">
              <a v-if="canDownloadCreditNote(props.row)" :href="creditNoteUrl(props.row)" target="_blank"
                class="download">
                Avoir {{ props.row.number }}
              </a>
              <div v-else>Avoir {{ props.row.number }}</div>
            </template>
            <div v-else>{{ getPaymentTitle(props.row) }}</div>
          </template>
          <template v-else-if="col.name === 'balance'">
            <q-item class="row no-wrap items-center">
              <q-item-section side>
                <q-icon :name="balanceIcon(col.value)" :color="balanceIconColor(col.value)" class="balance-icon"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ formatBalance(col.value) }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else-if="col.name === 'actions'">
            <q-btn v-if="displayActions && paymentTypes.includes(props.row.type)" flat dense color="grey" icon="edit"
              @click="openEditionModal(props.row)" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </template>
    <template v-slot:bottom-row="{ props }">
      <q-tr :props="props">
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
import SimpleTable from '@components/table/SimpleTable';
import { formatPrice } from '@helpers/utils';
import {
  CREDIT_NOTE,
  BILL,
  BANK_TRANSFER,
  DIRECT_DEBIT,
  CHECK,
  CESU,
  REFUND,
  PAYMENT_OPTIONS,
  CUSTOMER,
  PAYMENT,
  COMPANI,
} from 'src/core/data/constants';

export default {
  name: 'CustomerBillingTable',
  props: {
    documents: { type: Array, default: () => [] },
    billingDates: { type: Object, default: () => ({}) },
    displayActions: { type: Boolean, default: false },
    type: { type: String, default: CUSTOMER },
    startBalance: { type: Number, default: 0 },
    endBalance: { type: Number, default: 0 },
  },
  components: {
    'ni-simple-table': SimpleTable,
  },
  data () {
    return {
      CREDIT_NOTE,
      BILL,
      COMPANI,
      columns: [
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'document',
          label: '',
          align: 'left',
        },
        {
          name: 'inclTaxes',
          label: 'Montant TTC',
          align: 'center',
          field: row => this.getInclTaxes(row),
          format: value => formatPrice(value),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'center',
          field: 'balance',
          style: 'width: 100px',
          format: value => formatPrice(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
        },
      ],
      pagination: { rowsPerPage: 0 },
      paymentTypes: PAYMENT_OPTIONS.map(op => op.value),
    }
  },
  methods: {
    balanceIconColor (val) {
      return this.isZero(val) || !this.isNegative(val) ? 'grey' : 'secondary'
    },
    balanceIcon (val) {
      return this.isZero(val) || !this.isNegative(val) ? 'mdi-plus-circle-outline' : 'mdi-minus-circle-outline'
    },
    formatBalance (val) {
      if (this.isNegative(val)) return val.substring(1);
      else return val;
    },
    getPaymentTitle (payment) {
      const titlePrefix = payment.nature === PAYMENT ? `Paiement ${payment.number}` : `Remboursement ${payment.number}`;
      const paymentOption = PAYMENT_OPTIONS.find(opt => opt.value === payment.type);
      const typeLabel = paymentOption ? ` (${paymentOption.label})` : '';
      return `${titlePrefix}${typeLabel}`;
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
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
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    openEditionModal (payment) {
      this.$emit('openEditionModal', payment);
    },
    canDownloadBill (bill) {
      return (bill.number && bill.origin === COMPANI) || (bill.driveFile && bill.driveFile.link);
    },
    canDownloadCreditNote (creditNote) {
      return (creditNote.number && creditNote.origin === COMPANI) || (creditNote.driveFile && creditNote.driveFile.link);
    },
    billUrl (bill) {
      return get(bill, 'driveFile.link') ? bill.driveFile.link : Bills.getPDFUrl(bill._id);
    },
    creditNoteUrl (creditNote) {
      return get(creditNote, 'driveFile.link')
        ? creditNote.driveFile.link
        : CreditNotes.getPDFUrl(creditNote._id);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .bold
    font-weight bold;

  .q-table tbody tr:hover
    background: none;

  .q-btn
    height: 100%;

  .download
    cursor: pointer;
    color: $primary;
    text-decoration underline;

  /deep/ .q-item
    .q-item__section
      padding: 0px;

</style>
