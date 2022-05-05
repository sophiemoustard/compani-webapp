<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Factures manuelles" padding />
    <ni-simple-table :columns="columns" v-model:pagination="pagination" :data="manualBills"
      :loading="tableLoading" :rows-per-page="rowsPerPage" separator="none">
      <template #body="{ props }">
        <template v-for="(billingItem, index) of props.row.billingItemList" :key="`${props.row._id}-${index}`">
          <q-tr :props="props" :class="{ 'border-top': index === 0 }">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'billingItem'">{{ billingItem.name }}</template>
              <template v-if="col.name === 'unitInclTaxes'">{{ formatPrice(billingItem.unitInclTaxes) }}</template>
              <template v-if="col.name === 'count'">{{ billingItem.count }}</template>
              <template v-if="col.name === 'exclTaxes'">{{ formatPrice(billingItem.exclTaxes) }}</template>
              <template v-if="col.name === 'inclTaxes'">{{ formatPrice(billingItem.inclTaxes) }}</template>
              <template v-else-if="index === 0">{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
        <q-tr v-if="props.row.billingItemList.length > 1" :props="props">
          <q-td colspan="7"><div class="text-right">Total :</div></q-td>
          <q-td colspan="1" align="center">{{ formatPrice(props.row.netInclTaxes) }}</q-td>
        </q-tr>
      </template>
    </ni-simple-table>

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer une facture"
      @click="manualBillCreationModal = true" />

    <ni-manual-bill-creation-modal v-model="manualBillCreationModal" :validations="v$.newManualBill"
      :loading="modalLoading" v-model:new-manual-bill="newManualBill" :customers-options="customersOptions"
      :billing-items-options="billingItemsOptions" @hide="resetManualBillCreationModal" @submit="validateBillCreation"
      :billing-items="billingItems" @add-billing-item="addBillingItem" @update-billing-item="updateBillingItem"
      @remove-billing-item="removeBillingItem" />
  </q-page>
</template>

<script>
import { useMeta, useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import set from 'lodash/set';
import Customers from '@api/Customers';
import BillingItems from '@api/BillingItems';
import Bills from '@api/Bills';
import TitleHeader from '@components/TitleHeader';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { MANUAL } from '@data/constants';
import { formatAndSortIdentityOptions, formatAndSortOptions, formatIdentity, formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { strictPositiveNumber, positiveNumber } from '@helpers/vuelidateCustomVal';
import ManualBillCreationModal from 'src/modules/client/components/customers/billing/ManualBillCreationModal';
import SimpleTable from '@components/table/SimpleTable';

export default {
  name: 'ManualBills',
  components: {
    'ni-title-header': TitleHeader,
    'ni-manual-bill-creation-modal': ManualBillCreationModal,
    'ni-simple-table': SimpleTable,
  },
  setup () {
    const $q = useQuasar();
    const metaInfo = { title: 'Factures manuelles' };
    useMeta(metaInfo);

    const modalLoading = ref(false);
    const tableLoading = ref(false);
    const manualBills = ref([]);
    const manualBillCreationModal = ref(false);
    const newManualBill = ref({
      date: '',
      customer: '',
      billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
      netInclTaxes: 0,
      shouldBeSent: false,
    });
    const rowsPerPage = ref([1, 5, 15, 50, 100, 200, 300]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'date', descending: true });
    const billingItems = ref([]);
    const customers = ref([]);
    const columns = ref([
      { name: 'number', label: '#', align: 'left', field: 'number' },
      { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
      {
        name: 'customer',
        label: 'Bénéficiaire',
        align: 'left',
        field: row => formatIdentity(row.customer.identity, 'Lf'),
      },
      { name: 'billingItem', label: 'Article', align: 'center' },
      { name: 'unitInclTaxes', label: 'PU TTC', align: 'center' },
      { name: 'count', label: 'Quantité', align: 'center' },
      { name: 'exclTaxes', label: 'HT', align: 'center' },
      { name: 'inclTaxes', label: 'TTC', align: 'center' },
    ]);

    const rules = {
      newManualBill: {
        date: { required },
        customer: { required },
        billingItemList: {
          $each: helpers.forEach({
            billingItem: { required },
            unitInclTaxes: { positiveNumber, required },
            count: { strictPositiveNumber, required },
          }),
        },
      },
    };
    const v$ = useVuelidate(rules, { newManualBill });

    const customersOptions = computed(() => formatAndSortIdentityOptions(customers.value));

    const billingItemsOptions = computed(() => formatAndSortOptions(billingItems.value, 'name'));

    const getManualBills = async () => {
      try {
        tableLoading.value = true;

        manualBills.value = Object.freeze(await Bills.list({ type: MANUAL }));
      } catch (e) {
        manualBills.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des factures manuelles.');
      } finally {
        tableLoading.value = false;
      }
    };

    const formatCreationPayload = shouldBeSent => ({
      ...pick(newManualBill.value, ['customer', 'date']),
      shouldBeSent: !!shouldBeSent[0],
      billingItemList: newManualBill.value.billingItemList.map(bi => omit(bi, 'vat')),
    });

    const createManualBill = async (shouldBeSent) => {
      try {
        modalLoading.value = true;

        await Bills.create(formatCreationPayload(shouldBeSent));

        await getManualBills();
        manualBillCreationModal.value = false;
        NotifyPositive('Facture créée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la facture.');
      } finally {
        modalLoading.value = false;
      }
    };

    const validateBillCreation = () => {
      v$.value.newManualBill.$touch();
      if (v$.value.newManualBill.$error) return NotifyWarning('Champ(s) invalide(s)');

      $q.dialog({
        title: 'Confirmation',
        message: 'Cette opération est définitive. Confirmez-vous&nbsp;?',
        html: true,
        ok: 'Oui',
        cancel: 'Non',
        options: {
          type: 'checkbox',
          model: [true],
          items: [{ label: 'Envoyer par email', value: true, color: 'primary' }],
        },
      }).onOk(createManualBill)
        .onCancel(() => NotifyPositive('Facturation annulée.'));
    };

    const refresh = async () => {
      try {
        modalLoading.value = true;
        customers.value = Object.freeze(await Customers.list({ archived: false }));
        billingItems.value = Object.freeze(await BillingItems.list({ type: MANUAL }));
      } catch (e) {
        console.error(e);
      } finally {
        modalLoading.value = false;
      }
    };

    const addBillingItem = () => {
      newManualBill.value.billingItemList.push({ billingItem: '', unitInclTaxes: 0, count: 1 });
    };

    const removeBillingItem = (index) => {
      newManualBill.value.billingItemList.splice(index, 1);
    };

    const updateBillingItem = (event, index, path) => {
      set(newManualBill.value.billingItemList[index], path, event);
      if (path === 'billingItem') {
        const billingItem = billingItems.value.find(bi => bi._id === event);
        set(newManualBill.value.billingItemList[index], 'vat', billingItem?.vat || 0);
        set(newManualBill.value.billingItemList[index], 'unitInclTaxes', billingItem?.defaultUnitAmount || 0);
      }
    };

    const resetManualBillCreationModal = () => {
      newManualBill.value = {
        date: '',
        customer: '',
        billingItemList: [{ billingItem: '', unitInclTaxes: 0, count: 1 }],
      };
      v$.value.newManualBill.$reset();
    };

    return {
      // Data
      modalLoading,
      tableLoading,
      manualBills,
      manualBillCreationModal,
      newManualBill,
      rowsPerPage,
      pagination,
      customers,
      billingItems,
      columns,
      // Computed
      customersOptions,
      billingItemsOptions,
      // Methods
      formatCreationPayload,
      getManualBills,
      validateBillCreation,
      refresh,
      formatPrice,
      addBillingItem,
      removeBillingItem,
      updateBillingItem,
      resetManualBillCreationModal,
      // Validations
      v$,
    };
  },
  watch: {
    'newManualBill.billingItemList': {
      deep: true,
      handler () {
        this.newManualBill.netInclTaxes = this.newManualBill.billingItemList
          .reduce((acc, bi) => acc + bi.unitInclTaxes * bi.count, 0);
      },
    },
  },
  async created () {
    await Promise.all([this.getManualBills(), this.refresh()]);
  },
};
</script>

<style lang="sass" scoped>
.border-top td
  border-width: 1px 0 0 0
</style>
