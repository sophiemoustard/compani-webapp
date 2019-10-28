<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="À facturer">
      <template slot="content">
        <div class="col-xs-12 col-md-5 on-left">
          <ni-select :options="toBillOptions" v-model="toBillOption" separator />
        </div>
        <div class="col-xs-12 col-md-5">
          <ni-date-range v-model="billingDates" @input="getDraftBills" borderless :error.sync="billingDatesHasError" />
        </div>
      </template>
    </ni-title-header>
    <q-table :data="filteredAndOrderedDraftBills" :columns="columns" row-key="customerId" binary-state-sort
      :loading="tableLoading" :pagination.sync="pagination" separator="none" selection="multiple"
      :selected.sync="selected" class="q-pa-sm large-table" card-class="neutral-background" flat>
      <q-tr slot="header" slot-scope="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        <th>
          <q-checkbox v-model="props.selected" indeterminate-value="some" dense />
        </th>
      </q-tr>
      <template slot="body" slot-scope="props">
        <ni-to-bill-row v-for="(bill, index) in props.row.customerBills.bills" :key="bill._id" :props="props"
          @discount:click="discountEdit($event, bill)" @datetime:input="refreshBill(props.row, bill)"
          @discount:input="computeTotalAmount(props.row.customerBills)" :index="index" :bill.sync="bill"
          display-checkbox />
        <q-tr v-if="props.row.customerBills.bills.length > 1" :props="props">
          <q-td colspan="10">
            <div class="text-right">Total :</div>
          </q-td>
          <q-td colspan="1" align="center">{{ formatPrice(props.row.customerBills.total) }}</q-td>
          <q-td colspan="1" />
        </q-tr>
        <template v-if="props.row.thirdPartyPayerBills">
          <template v-for="tpp in props.row.thirdPartyPayerBills">
            <ni-to-bill-row v-for="(bill, index) in tpp.bills" :key="bill._id" :props="props" :bill.sync="bill"
              @discount:click="discountEdit($event, bill)" @datetime:input="refreshBill(props.row, bill)"
              @discount:input="computeTotalAmount(tpp)" display-checkbox :index="index" />
          </template>
        </template>
      </template>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="filteredAndOrderedDraftBills" />
    </q-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      :label="totalToBillLabel" @click="createBills" />
  </q-page>
</template>

<script>
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import DateRange from '../../../components/form/DateRange';
import ToBillRow from '../../../components/table/ToBillRow';
import BillingPagination from '../../../components/table/BillingPagination';
import Select from '../../../components/form/Select';
import TitleHeader from '../../../components/TitleHeader';
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import { billingMixin } from '../../../mixins/billingMixin.js';
import { formatPrice, formatIdentity } from '../../../helpers/utils';

export default {
  name: 'ToBill',
  metaInfo: {
    title: 'A facturer',
  },
  mixins: [billingMixin],
  components: {
    'ni-to-bill-row': ToBillRow,
    'ni-date-range': DateRange,
    'ni-billing-pagination': BillingPagination,
    'ni-select': Select,
    'ni-title-header': TitleHeader,
  },
  data () {
    return {
      tableLoading: false,
      pagination: { rowsPerPage: 0 },
      billingDates: {
        startDate: null,
        endDate: null,
      },
      billingDatesHasError: false,
      draftBills: [],
      selected: [],
      columns: [
        {
          name: 'externalBilling',
          label: 'Factu. externe',
          align: 'left',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => formatIdentity(row.customer.identity, 'Lf'),
        },
        {
          name: 'client',
          label: 'Client',
          align: 'left',
        },
        {
          name: 'startDate',
          label: 'Début F.',
          align: 'left',
        },
        {
          name: 'endDate',
          label: 'Fin F.',
          align: 'left',
        },
        {
          name: 'service',
          label: 'Service',
          align: 'left',
        },
        {
          name: 'hours',
          label: 'Décompte',
          align: 'center',
        },
        {
          name: 'unitExclTaxes',
          label: 'PU HT',
          align: 'center',
        },
        {
          name: 'discount',
          label: 'Remise TTC',
          align: 'center',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'center',
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'center',
        },
      ],
      toBillOptions: [
        { label: 'Tous', value: 0 },
        { label: 'Sans tiers payeur', value: 1 },
        { label: 'Avec tiers payeur', value: 2 },
      ],
      toBillOption: 0,
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    hasSelectedRows () {
      return this.selected.length > 0;
    },
    totalToBillLabel () {
      if (this.hasSelectedRows) {
        let total = 0;
        for (const row of this.selected) {
          if (row.customerBills) total += row.customerBills.total;
          if (row.thirdPartyPayerBills) {
            for (const bill of row.thirdPartyPayerBills) {
              total += bill.total;
            }
          }
        }
        return `Facturer ${formatPrice(total)}`;
      }
      return 'Facturer';
    },
    filteredAndOrderedDraftBills () {
      const orderedByCustomerDraftBills = orderBy(this.draftBills, (row) => get(row, 'customer.identity.lastname', '').toLowerCase(), ['asc']);
      if (this.toBillOption === 1) return orderedByCustomerDraftBills.filter(draft => !draft.thirdPartyPayerBills);
      if (this.toBillOption === 2) {
        return orderBy(
          orderedByCustomerDraftBills.filter(draft => draft.thirdPartyPayerBills),
          (row) => get(row, 'thirdPartyPayerBills[0].bills[0].thirdPartyPayer.name', '').toLowerCase(),
          ['asc']
        );
      }
      return orderedByCustomerDraftBills;
    },
  },
  watch: {
    filteredAndOrderedDraftBills () {
      this.selected = [];
    },
  },
  async mounted () {
    this.setBillingDates();
    await this.getDraftBills();
  },
  methods: {
    formatPrice (value) {
      return formatPrice(value);
    },
    computeTotalAmount (data) {
      const total = data.bills.reduce((prev, next) => prev + (next.inclTaxes - next.discount), 0);
      data.total = total;
      return total;
    },
    discountEdit ({ ref }, bill) {
      bill.discountEdition = true;
      this.$nextTick(() => {
        ref.focus();
      });
    },
    addEditDiscountToBills (bills) {
      return bills.map(bill => ({ ...bill, discountEdition: false }));
    },
    async getDraftBills () {
      if (this.billingDatesHasError) return;

      try {
        this.tableLoading = true;
        const params = {
          endDate: this.$moment(this.billingDates.endDate).endOf('d').toISOString(),
          billingStartDate: this.$moment(this.billingDates.startDate).startOf('d').toISOString(),
          billingPeriod: this.user.company.customersConfig.billingPeriod,
        }

        const draftBills = await this.$bills.getDraftBills(params);
        this.draftBills = draftBills.map((draft) => {
          return {
            ...draft,
            customerBills: { total: draft.customerBills.total, bills: this.addEditDiscountToBills(draft.customerBills.bills) },
            ...(!!draft.thirdPartyPayerBills && {
              thirdPartyPayerBills: draft.thirdPartyPayerBills.map(tpp => ({ ...tpp, bills: this.addEditDiscountToBills(tpp.bills) })),
            }),
          }
        });
      } catch (e) {
        this.draftBills = [];
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données à facturer');
      } finally {
        this.tableLoading = false;
      }
    },
    async createBills () {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non',
          options: {
            type: 'checkbox',
            model: [true],
            items: [{ label: 'Envoyer par email', value: true, color: 'primary' }],
          },
        }).onOk(async (shouldBeSent) => {
          if (!this.hasSelectedRows) return;
          const bills = this.selected.map(row => ({
            ...this.$_.omit(row, ['__index']),
            customerBills: {
              ...row.customerBills,
              shouldBeSent: !!shouldBeSent[0],
            },
          }));
          await this.$bills.create({ bills });
          NotifyPositive('Clients facturés');
          await this.getDraftBills();
          this.selected = [];
        });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la facturation des clients');
      }
    },
    async refreshBill (row, bill) {
      try {
        const { customer, __index } = row;
        const { startDate, endDate } = bill;
        const draftBills = await this.$bills.getDraftBills({
          billingStartDate: startDate,
          startDate: this.$moment(startDate).startOf('d').toISOString(),
          endDate: this.$moment(endDate).endOf('d').toISOString(),
          billingPeriod: this.user.company.customersConfig.billingPeriod,
          customer: customer._id,
        });
        this.draftBills.splice(__index, 1, ...draftBills);
        NotifyPositive('Date de début de facturation modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la date de début de facturation');
      }
    },
  },
}
</script>
