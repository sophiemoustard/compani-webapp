<template>
  <ni-simple-table :data="documents" :columns="columns" :loading="loading" :responsive="false" hide-bottom>
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
              <a v-else-if="getUrl(props.row)" :href="getUrl(props.row)" target="_blank" class="download"
                data-cy="link">
                  Facture {{ props.row.number }}
              </a>
              <div v-else @click="downloadBillPdf(props.row)" :class="{ 'download': canDownload(props.row) }"
                data-cy="link">
                Facture {{ props.row.number }}
              </div>
            </template>
            <template v-else-if="props.row.type === CREDIT_NOTE">
              <a v-if="getUrl(props.row)" :href="getUrl(props.row)" target="_blank" class="download"
                data-cy="link">
                  Avoir {{ props.row.number }}
              </a>
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
          <template v-else-if="col.name === 'actions'">
            <q-btn v-if="displayActions && paymentTypes.includes(props.row.type)" flat dense color="grey" icon="edit"
              @click="openEditionModal(props.row)" />
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
import SimpleTable from '@components/table/SimpleTable';
import { NotifyNegative } from '@components/popup/notify';
import { formatPrice } from '@helpers/utils';
import { openPdf } from '@helpers/file';
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
} from '@data/constants';

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
          format: value => (value ? this.$moment(value).format('DD/MM/YYYY') : ''),
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
    };
  },
  methods: {
    balanceIconColor (val) {
      return this.isZero(val) || !this.isNegative(val) ? 'grey' : 'secondary';
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
      this.$emit('open-edition-modal', payment);
    },
    getUrl (doc) {
      return get(doc, 'driveFile.link');
    },
    canDownload (doc) {
      return doc.origin === COMPANI;
    },
    async downloadBillPdf (bill) {
      if (!this.canDownload(bill)) return;

      try {
        const pdf = await Bills.getPdf(bill._id);
        openPdf(pdf, this.$q.platform);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la facture');
      }
    },
    async downloadCreditNotePdf (cn) {
      if (!this.canDownload(cn)) return;

      try {
        const pdf = await CreditNotes.getPdf(cn._id);
        openPdf(pdf, this.$q.platform);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la facture');
      }
    },
  },
};
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
