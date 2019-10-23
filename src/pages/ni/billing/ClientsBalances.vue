<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Balances Clients</h4>
    </div>
    <q-table :data="balances" :columns="columns" row-key="rowId" binary-state-sort :loading="tableLoading"
      :pagination.sync="pagination" selection="multiple" :selected.sync="selected" class="q-pa-sm"
      card-class="neutral-background" flat>
      <q-tr slot="header" slot-scope="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        <q-th auto-width>
          <q-checkbox @input="selectRows(props.selected)" v-model="props.selected" indeterminate-value="some" dense />
        </q-th>
      </q-tr>
      <q-tr :props="props" slot="body" slot-scope="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template v-if="col.name === 'client' || col.name === 'customer'">
            <span class="uppercase text-weight-bold">{{ col.value }}</span>
          </template>
          <template v-else-if="col.name === 'actions'">
            <div class="row no-wrap table-actions">
              <q-btn flat round color="grey" icon="remove_red_eye" size="12px"
                @click="goToCustomerBillingPage(col.value)" />
              <q-btn flat round color="grey" icon="add" size="12px"
                @click="openPaymentCreationModal(props.row.customer, props.row.thirdPartyPayer)" />
            </div>
          </template>
          <template v-else-if="col.name === 'balance'">
            <ni-prefixed-cell-content :cell-value="col.value" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <q-td v-if="props.row.toPay > 0" align="right" auto-width>
          <q-checkbox v-model="props.selected" dense />
        </q-td>
        <q-td v-else />
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="balances" />
    </q-table>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal v-model="paymentCreationModal" :newPayment="newPayment" :validations="$v.newPayment" :selectedClientName="selectedClientName"
      @createPayment="createPayment" :selectedCustomer="selectedCustomer"
      :loading="creationLoading" @resetForm="resetPaymentCreationModal"  />

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer les prélèvements"
      :disable="selected.length === 0" @click="createPayments" />
  </q-page>
</template>

<script>
import BillingPagination from '../../../components/table/BillingPagination';
import PrefixedCellContent from '../../../components/table/PrefixedCellContent';
import PaymentCreationModal from '../../../components/customers/PaymentCreationModal';
import { paymentMixin } from '../../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import { formatPrice, getLastVersion, formatIdentity } from '../../../helpers/utils.js';

export default {
  name: 'ClientsBalances',
  metaInfo: {
    title: 'Balances clients',
  },
  components: {
    'ni-billing-pagination': BillingPagination,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-payment-creation-modal': PaymentCreationModal,
  },
  mixins: [paymentMixin],
  data () {
    return {
      tableLoading: false,
      selected: [],
      balances: [],
      columns: [
        {
          name: 'client',
          label: 'Client',
          align: 'left',
          field: row => row.thirdPartyPayer ? row.thirdPartyPayer.name : formatIdentity(row.customer.identity, 'Lf'),
          format: val => val.length > 30 ? `${val.slice(0, 30)}...` : val,
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => formatIdentity(row.customer.identity, 'Lf'),
        },
        {
          name: 'billed',
          label: 'Facturé TTC',
          align: 'left',
          field: row => row.billed,
          format: val => formatPrice(val),
        },
        {
          name: 'paid',
          label: 'Payé TTC',
          align: 'left',
          field: row => row.paid,
          format: val => formatPrice(val),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'left',
          field: row => row.balance,
        },
        {
          name: 'toPay',
          label: 'A Prélever',
          align: 'left',
          field: row => formatPrice(row.toPay),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: row => row.customer._id,
        },
      ],
      pagination: {
        sortBy: 'customer',
        ascending: true,
        rowsPerPage: 0,
      },
    }
  },
  async mounted () {
    await this.getBalances();
  },
  methods: {
    goToCustomerBillingPage (customerId) {
      this.$router.push({ name: 'customers profile', params: { id: customerId, defaultTab: 'billing' } });
    },
    selectRows (oldValue) {
      if (oldValue) this.selected = [];
      else this.selected = this.balances.filter(bl => bl.toPay > 0);
    },
    // Refresh
    async getBalances () {
      try {
        this.tableLoading = true;
        this.balances = await this.$balances.showAll();
        this.balances = this.balances.map(balance => ({ ...balance, rowId: this.$_.uniqueId() }))
      } catch (e) {
        this.balances = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    async createPayment () {
      try {
        this.creationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.formatPayload(this.newPayment);
        await this.$payments.create(payload);
        NotifyPositive('Règlement créé');
        await this.getBalances();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.creationLoading = false;
      }
    },
    async createPayments () {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non',
        }).onOk(async () => {
          const payload = this.selected.map((row) => {
            return {
              nature: this.PAYMENT,
              customer: row._id.customer,
              customerInfo: row.customer,
              netInclTaxes: row.toPay,
              type: this.PAYMENT_OPTIONS[0].value,
              date: this.$moment().toDate(),
              rum: getLastVersion(row.customer.payment.mandates, 'createdAt').rum,
            }
          });
          await this.$payments.createList(payload);
          NotifyPositive('Règlement(s) créé(s)');
          await this.getBalances();
        });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du(des) règlement(s)');
      } finally {
        this.selected = [];
        this.creationLoading = false;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-table
    & tbody tr.selected
      background: $white
    &-bottom > .q-icon
      display: none
</style>
