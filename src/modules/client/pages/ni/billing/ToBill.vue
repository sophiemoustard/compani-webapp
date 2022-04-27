<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="À facturer" padding>
      <template #content>
        <div class="header-selects">
          <div class="row header-selects-container">
            <div class="col-xs-12 col-sm-4">
              <ni-select class="q-ma-sm" :options="toBillOptions" v-model="toBillOption" data-cy="select-tpp" />
            </div>
            <div class="col-xs-12 col-sm-8">
              <ni-date-range v-model="billingDates" @blur="getDraftBills" v-model:error="billingDatesHasError"
                borderless class="q-ma-sm" />
            </div>
          </div>
        </div>
      </template>
    </ni-title-header>
    <ni-button @click="openDeliveryDownloadModal" label="Télécharger un fichier de télétransmission" />
    <ni-simple-table :data="filteredAndOrderedDraftBills" :columns="columns" v-model:pagination="pagination"
      :row-key="tableRowKey" :loading="tableLoading" selection="multiple" v-model:selected="selected"
      data-cy="client-table" separator="none">
      <template #header="{ props }">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
          <th>
            <q-checkbox v-model="props.selected" indeterminate-value="some" dense />
          </th>
        </q-tr>
      </template>
      <template #body="{ props }">
        <ni-to-bill-row v-for="(bill, index) in props.row.customerBills.bills" :key="bill._id" :props="props"
          @discount-click="discountEdit($event, bill)" @datetime-input="refreshBill(props.row, bill)"
          @discount-input="computeTotalAmount(props.row.customerBills)" :index="index" v-model:selected="props.selected"
          v-model:bill="props.row.customerBills.bills[index]" display-checkbox data-cy="bill-row" />
        <q-tr v-if="props.row.customerBills.bills.length > 1" :props="props">
          <q-td colspan="10">
            <div class="text-right">Total :</div>
          </q-td>
          <q-td colspan="1" align="center">{{ formatPrice(props.row.customerBills.total) }}</q-td>
          <q-td colspan="1" />
        </q-tr>
        <template v-if="props.row.thirdPartyPayerBills">
          <template v-for="tpp in props.row.thirdPartyPayerBills">
            <ni-to-bill-row v-for="(bill, index) in tpp.bills" :key="bill._id" :props="props" data-cy="bill-row"
              @discount-click="discountEdit($event, bill)" @datetime-input="refreshBill(props.row, bill)"
              @discount-input="computeTotalAmount(tpp)" display-checkbox :index="index" v-model:bill="tpp.bills[index]"
              v-model:selected="props.selected" />
          </template>
        </template>
      </template>
    </ni-simple-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      :label="totalToBillLabel" @click="validateBillListCreation" data-cy="to-bill-button" />

    <delivery-download-modal v-model="deliveryDownloadModal" :delivery-file="deliveryFile" :loading="modalLoading"
      :validations="v$.deliveryFile" :tpp-options="thirdPartyPayerOptions" :month-options="monthOptions"
      @submit="downloadDeliveryFile" @hide="resetDeliveryDownloadModal" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { mapGetters } from 'vuex';
import capitalize from 'lodash/capitalize';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import Bills from '@api/Bills';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import Teletransmission from '@api/Teletransmission';
import DateRange from '@components/form/DateRange';
import SimpleTable from '@components/table/SimpleTable';
import Select from '@components/form/Select';
import Button from '@components/Button';
import TitleHeader from '@components/TitleHeader';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { MONTH } from '@data/constants';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';
import { formatPrice, formatIdentity, formatAndSortOptions, toEuros, toCents } from '@helpers/utils';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import DeliveryDownloadModal from 'src/modules/client/components/customers/billing/DeliveryDownloadModal';
import ToBillRow from 'src/modules/client/components/table/ToBillRow';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'ToBill',
  mixins: [tableMixin],
  components: {
    'ni-to-bill-row': ToBillRow,
    'ni-date-range': DateRange,
    'ni-simple-table': SimpleTable,
    'ni-select': Select,
    'ni-button': Button,
    'ni-title-header': TitleHeader,
    'delivery-download-modal': DeliveryDownloadModal,
  },
  setup () {
    const metaInfo = { title: 'À facturer' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
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
        { name: 'externalBilling', label: 'Factu. externe', align: 'center' },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => formatIdentity(row.customer.identity, 'Lf'),
        },
        { name: 'client', label: 'Client', align: 'left' },
        { name: 'startDate', label: 'Début F.', align: 'left' },
        { name: 'endDate', label: 'Fin F.', align: 'left' },
        { name: 'service', label: 'Service', align: 'left' },
        { name: 'hours', label: 'Décompte', align: 'center' },
        { name: 'unitExclTaxes', label: 'PU HT', align: 'center' },
        { name: 'discount', label: 'Remise TTC', align: 'center' },
        { name: 'exclTaxes', label: 'HT', align: 'center' },
        { name: 'inclTaxes', label: 'TTC', align: 'center' },
      ],
      toBillOptions: [
        { label: 'Tous', value: 0 },
        { label: 'Sans tiers payeur', value: 1 },
        { label: 'Avec tiers payeur', value: 2 },
      ],
      toBillOption: 0,
      deliveryDownloadModal: false,
      deliveryFile: { thirdPartyPayers: [], month: moment().format('MM-YYYY') },
      thirdPartyPayerOptions: [],
      thirdPartyPayers: [],
      monthOptions: [
        { label: capitalize(moment().format('MMMM YY')), value: moment().format('MM-YYYY') },
        {
          label: capitalize(moment().subtract(1, 'month').format('MMMM YY')),
          value: moment().subtract(1, 'month').format('MM-YYYY'),
        },
      ],
      modalLoading: false,
    };
  },
  validations () {
    return {
      deliveryFile: { thirdPartyPayers: { minArrayLength: minArrayLength(1) }, month: { required } },
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
    hasSelectedRows () {
      return this.selected.length > 0;
    },
    totalToBillLabel () {
      if (this.hasSelectedRows) {
        let totalCents = 0;
        for (const row of this.selected) {
          if (row.customerBills) totalCents += toCents(row.customerBills.total);
          if (row.thirdPartyPayerBills) {
            for (const bill of row.thirdPartyPayerBills) {
              totalCents += toCents(bill.total);
            }
          }
        }
        return `Facturer ${formatPrice(toEuros(totalCents))}`;
      }
      return 'Facturer';
    },
    filteredAndOrderedDraftBills () {
      const orderedByCustomerDraftBills = orderBy(
        this.draftBills,
        row => get(row, 'customer.identity.lastname', '').toLowerCase(),
        ['asc']
      );
      if (this.toBillOption === 1) return orderedByCustomerDraftBills.filter(draft => !draft.thirdPartyPayerBills);
      if (this.toBillOption === 2) {
        return orderBy(
          orderedByCustomerDraftBills.filter(draft => draft.thirdPartyPayerBills),
          row => get(row, 'thirdPartyPayerBills[0].bills[0].thirdPartyPayer.name', '').toLowerCase(),
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
  async created () {
    this.setBillingDates();
    await Promise.all([this.getDraftBills(), this.getThirdPartyPayers()]);
  },
  methods: {
    formatPrice,
    openDeliveryDownloadModal () {
      this.deliveryDownloadModal = true;
    },
    resetDeliveryDownloadModal () {
      this.v$.deliveryFile.$reset();
      this.deliveryFile = { thirdPartyPayers: [], month: moment().format('MM-YYYY') };
    },
    getFileName () {
      const tpp = this.thirdPartyPayers.find(t => this.deliveryFile.thirdPartyPayers.includes(t._id));

      const month = moment(this.deliveryFile.month, 'MM-YYYY').format('YYYYMM');
      const date = moment().format('YYMMDDHHmm');

      return `${tpp.companyCode}-${month}-${tpp.teletransmissionType}-${date}.xml`;
    },
    async downloadDeliveryFile () {
      try {
        this.v$.deliveryFile.$touch();
        if (this.v$.deliveryFile.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        const file = await Teletransmission.downloadDeliveryFile(this.deliveryFile);
        await downloadFile(file, this.getFileName());

        this.deliveryDownloadModal = false;
      } catch (e) {
        NotifyNegative('Erreur lors du téléchargement du fichier.');
        console.error(e);
      } finally {
        this.modalLoading = false;
      }
    },
    computeTotalAmount (data) {
      const totalCents = data.bills
        .reduce((prev, next) => prev + (toCents(next.inclTaxes) - toCents(next.discount)), 0);
      data.total = toEuros(totalCents);

      return toEuros(totalCents);
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
    setBillingDates () {
      const billingPeriod = get(this.company, 'customersConfig.billingPeriod');
      if (billingPeriod === MONTH) {
        this.billingDates = {
          startDate: moment().subtract(1, 'M').startOf('month').toISOString(),
          endDate: moment().subtract(1, 'M').endOf('month').toISOString(),
        };
      } else {
        this.billingDates = {
          startDate: moment().date() > 15
            ? moment().startOf('month').toISOString()
            : moment().subtract(1, 'M').date(16).startOf('d')
              .toISOString(),
          endDate: moment().date() > 15
            ? moment().date(15).endOf('d').toISOString()
            : moment().subtract(1, 'M').endOf('month').toISOString(),
        };
      }
    },
    async getDraftBills () {
      if (this.billingDatesHasError) return;

      try {
        this.tableLoading = true;
        const params = {
          endDate: moment(this.billingDates.endDate).endOf('d').toISOString(),
          billingStartDate: moment(this.billingDates.startDate).startOf('d').toISOString(),
          billingPeriod: get(this.company, 'customersConfig.billingPeriod'),
        };

        const draftBills = await Bills.getDraftBills(params);
        this.draftBills = draftBills.map(draft => ({
          ...draft,
          customerBills: {
            total: draft.customerBills.total,
            bills: this.addEditDiscountToBills(draft.customerBills.bills),
          },
          ...(!!draft.thirdPartyPayerBills && {
            thirdPartyPayerBills:
                draft.thirdPartyPayerBills.map(tpp => ({ ...tpp, bills: this.addEditDiscountToBills(tpp.bills) })),
          }),
        }));
      } catch (e) {
        this.draftBills = [];
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données à facturer.');
      } finally {
        this.tableLoading = false;
      }
    },
    async getThirdPartyPayers () {
      try {
        this.thirdPartyPayers = await ThirdPartyPayers.list();
        this.thirdPartyPayerOptions = formatAndSortOptions(
          this.thirdPartyPayers.filter(tpp => !!tpp.teletransmissionId),
          'name'
        );
      } catch (e) {
        this.thirdPartyPayerOptions = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des tiers-payeurs.');
      }
    },
    async createBillsBatch (shouldBeSent) {
      try {
        if (!this.hasSelectedRows) return;
        const BATCH_SIZE = 25;
        const bills = this.selected.map(row => ({
          ...row,
          customerBills: { ...row.customerBills, shouldBeSent: !!shouldBeSent[0] },
        }));

        for (let i = 0, l = bills.length; i < l; i += BATCH_SIZE) {
          await Bills.createList({ bills: bills.slice(i, i + BATCH_SIZE) });
        }

        this.selected = [];
        await this.getDraftBills();
        NotifyPositive('Clients facturés.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la facturation des clients.');
      }
    },
    validateBillListCreation () {
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
      }).onOk(this.createBillsBatch)
        .onCancel(() => NotifyPositive('Facturation annulée.'));
    },
    async refreshBill (row, bill) {
      try {
        const { customer } = row;
        const { startDate, endDate } = bill;
        const index = this.getRowIndex(this.draftBills, row);

        const draftBills = await Bills.getDraftBills({
          billingStartDate: startDate,
          startDate: moment(startDate).startOf('d').toISOString(),
          endDate: moment(endDate).endOf('d').toISOString(),
          billingPeriod: get(this.company, 'customersConfig.billingPeriod'),
          customer: customer._id,
        });
        this.draftBills.splice(index, 1, ...draftBills);
        NotifyPositive('Date de début de facturation modifiée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la date de début de facturation.');
      }
    },
    tableRowKey (row) {
      return row.customer._id;
    },
  },
};
</script>

<style lang="sass" scoped>
.selects
  @media screen and (min-width: 768px) and (max-width: $breakpoint-sm-max)
    padding-left: 10px
    padding-right: 10px
  @media screen and (max-width: $breakpoint-sm-max)
    margin: 0px !important
</style>
