<template>
  <q-page class="vendor-background q-pb-xl">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Suivi des factures</p>
      <ni-expanding-table :data="courseBills" :columns="columns" v-model:pagination="pagination" :hide-bottom="false"
        :loading="loading">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'number'">
              <div class="cliquable-name" @click.stop="downloadBill(props.row._id)" :disable="pdfLoading">
                {{ col.value }}
              </div>
              <div class="flex">
                <div class="program ellipsis">{{ `${get(props.row, 'course.subProgram.program.name')}` }}</div>
                <div v-if="get(props.row, 'course.misc')" class="misc">- {{ get(props.row, 'course.misc') }}</div>
              </div>
              <div class="row items-center" v-if="props.row.courseCreditNote">
                <q-icon size="12px" name="fas fa-times-circle" color="orange-500 attendance" />
                <div class="q-ml-xs text-orange-500">Annulée par avoir - {{ props.row.courseCreditNote.number }}</div>
              </div>
            </template>
            <template v-else-if="col.name === 'progress' && col.value >= 0">
              <ni-progress class="q-ml-lg" :value="col.value" />
            </template>
            <template v-else-if="col.name === 'payment'">
              <div class="row justify-center table-actions">
                <ni-button icon="add" :disable="paymentCreationLoading" color="white" class="add-payment"
                  @click="openCoursePaymentCreationModal(props.row)" />
              </div>
            </template>
            <template v-else-if="col.name === 'expand'">
              <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </template>
        <template #expanding-row="{ props }">
          <q-td colspan="100%" class="cell">
            <div v-if="!props.row.coursePayments.length && !props.row.courseCreditNote" class="text-italic text-center">
              Aucun règlement renseigné.
            </div>
            <div v-else v-for="item in getSortedItems(props.row)" :key="item._id" :props="props" class="q-my-sm row">
              <div class="date">{{ formatDate(item.date) }}</div>
              <div class="payment">{{ item.number }} ({{ getItemType(item) }})</div>
              <div class="area" />
              <div v-if="item.netInclTaxes" class="paid">
                {{ item.nature === REFUND ? '-' : '' }} {{ formatPrice(item.netInclTaxes) }}
              </div>
              <div v-else class="paid">{{ formatPrice(props.row.netInclTaxes) }}</div>
              <div v-if="item.netInclTaxes" class="edit">
                <q-icon size="20px" name="edit" color="copper-grey-500"
                  @click="openCoursePaymentEditionModal(props.row, item)" />
              </div>
            </div>
          </q-td>
        </template>
        <template #bottom-row="{ props }">
      <q-tr class="text-weight-bold" :props="props">
        <q-td />
        <q-td />
        <q-td />
        <q-td />
        <q-td><div class="flex justify-end items-center">Total</div></q-td>
        <q-td><div class="flex justify-end items-center">{{ getTotal(courseBills) }}</div></q-td>
        <q-td />
        <q-td />
      </q-tr>
    </template>
      </ni-expanding-table>

      <ni-course-payment-creation-modal v-model:new-course-payment="newCoursePayment" @submit="createPayment"
        v-model="coursePaymentCreationModal" :loading="paymentCreationLoading" @hide="resetCoursePaymentCreationModal"
        :validations="validations.newCoursePayment" :course-payment-meta-info="coursePaymentMetaInfo" />

       <ni-course-payment-edition-modal v-model:edited-course-payment="editedCoursePayment" @submit="editPayment"
        v-model="coursePaymentEditionModal" :loading="paymentEditionLoading" @hide="resetCoursePaymentEditionModal"
        :validations="validations.editedCoursePayment" :course-payment-meta-info="coursePaymentMetaInfo" />
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import CourseBills from '@api/CourseBills';
import CoursePayments from '@api/CoursePayments';
import Button from '@components/Button';
import Progress from '@components/CourseProgress';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import ExpandingTable from '@components/table/ExpandingTable';
import { BALANCE, PAYMENT, PAYMENT_OPTIONS, CREDIT_OPTION, REFUND } from '@data/constants.js';
import { formatDate, ascendingSort } from '@helpers/date';
import { downloadFile } from '@helpers/file';
import { formatPrice, formatPriceWithSign, readAPIResponseWithTypeArrayBuffer } from '@helpers/utils';
import { positiveNumber } from '@helpers/vuelidateCustomVal';
import CoursePaymentCreationModal from '../billing/CoursePaymentCreationModal';
import CoursePaymentEditionModal from '../billing/CoursePaymentEditionModal';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-expanding-table': ExpandingTable,
    'ni-progress': Progress,
    'ni-button': Button,
    'ni-course-payment-creation-modal': CoursePaymentCreationModal,
    'ni-course-payment-edition-modal': CoursePaymentEditionModal,
  },
  setup () {
    const $store = useStore();
    const courseBills = ref([]);
    const loading = ref(false);
    const pdfLoading = ref(false);
    const paymentCreationLoading = ref(false);
    const paymentEditionLoading = ref(false);
    const coursePaymentMetaInfo = ref({ number: '', courseName: '', netInclTaxes: '' });
    const coursePaymentCreationModal = ref(false);
    const coursePaymentEditionModal = ref(false);
    const newCoursePayment = ref({ nature: PAYMENT, type: '', netInclTaxes: '', date: '', courseBill: '' });
    const editedCoursePayment = ref({ _id: '', nature: '', type: '', netInclTaxes: '', date: '' });
    const columns = ref([
      {
        name: 'date',
        label: 'Date',
        field: 'billedAt',
        format: value => formatDate(value),
        align: 'left',
        style: 'width: 10%',
      },
      { name: 'number', label: '#', field: 'number', align: 'left', style: 'width: 30%' },
      { name: 'progress', label: 'Avancement formation', field: 'progress', align: 'center', style: 'width: 15%' },
      {
        name: 'netInclTaxes',
        label: 'Montant',
        field: 'netInclTaxes',
        format: formatPrice,
        align: 'center',
        style: 'width: 10%',
      },
      {
        name: 'paid',
        label: 'Réglé/crédité',
        field: 'paid',
        format: formatPrice,
        align: 'center',
        style: 'width: 10%',
      },
      {
        name: 'total',
        label: 'Solde',
        field: 'total',
        format: formatPriceWithSign,
        align: 'center',
        style: 'font-weight: 700; width: 10%',
      },
      { name: 'payment', label: '', align: 'center', field: val => val.coursePayments || '', style: 'width: 10%' },
      { name: 'expand', label: '', field: '' },
    ]);
    const pagination = ref({ sortBy: 'date', ascending: true, page: 1, rowsPerPage: 15 });

    const rules = {
      newCoursePayment: {
        nature: { required },
        netInclTaxes: { required, positiveNumber },
        type: { required },
        date: { required },
      },
      editedCoursePayment: {
        netInclTaxes: { required, positiveNumber },
        type: { required },
        date: { required },
      },
    };

    const validations = useVuelidate(rules, { newCoursePayment, editedCoursePayment });

    const company = computed(() => $store.state.company.company);

    const refreshCourseBills = async () => {
      try {
        loading.value = true;
        courseBills.value = await CourseBills.list({ company: company.value._id, action: BALANCE });
      } catch (e) {
        console.error(e);
        courseBills.value = [];
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        loading.value = false;
      }
    };

    const downloadBill = async (billId) => {
      try {
        pdfLoading.value = true;
        const pdf = await CourseBills.getPdf(billId);
        downloadFile(pdf, 'facture.pdf', 'application/octet-stream');
      } catch (e) {
        console.error(e);
        if (e.status === 404) {
          const { message } = readAPIResponseWithTypeArrayBuffer(e);
          return NotifyNegative(message);
        }
        NotifyNegative('Erreur lors du téléchargement de la facture.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const openCoursePaymentCreationModal = (courseBill) => {
      coursePaymentMetaInfo.value = {
        number: courseBill.number,
        netInclTaxes: courseBill.netInclTaxes,
        courseName: `${company.value.name} - ${courseBill.course.subProgram.program.name} - ${courseBill.course.misc}`,
      };
      newCoursePayment.value.courseBill = courseBill._id;
      coursePaymentCreationModal.value = true;
    };

    const openCoursePaymentEditionModal = (courseBill, coursePayment) => {
      coursePaymentMetaInfo.value = {
        number: courseBill.number,
        netInclTaxes: courseBill.netInclTaxes,
        courseName: `${company.value.name} - ${courseBill.course.subProgram.program.name} - ${courseBill.course.misc}`,
      };
      editedCoursePayment.value = pick(coursePayment, ['_id', 'nature', 'netInclTaxes', 'type', 'date']);
      coursePaymentEditionModal.value = true;
    };

    const createPayment = async () => {
      try {
        validations.value.newCoursePayment.$touch();
        if (validations.value.newCoursePayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        paymentCreationLoading.value = true;
        await CoursePayments.create({ ...newCoursePayment.value, company: company.value._id });
        NotifyPositive('Règlement créé.');

        coursePaymentCreationModal.value = false;
        await refreshCourseBills();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement.');
      } finally {
        paymentCreationLoading.value = false;
      }
    };

    const editPayment = async () => {
      try {
        validations.value.editedCoursePayment.$touch();
        if (validations.value.editedCoursePayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        paymentEditionLoading.value = true;
        await CoursePayments.update(
          editedCoursePayment.value._id,
          { ...omit(editedCoursePayment.value, ['_id', 'nature']) }
        );
        NotifyPositive('Règlement modifié.');

        coursePaymentEditionModal.value = false;
        await refreshCourseBills();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du règlement.');
      } finally {
        paymentEditionLoading.value = false;
      }
    };

    const resetCoursePaymentCreationModal = () => {
      newCoursePayment.value = { nature: PAYMENT, type: '', netInclTaxes: '', date: '', courseBill: '' };
      coursePaymentMetaInfo.value = { number: '', courseName: '', netInclTaxes: '' };
      validations.value.newCoursePayment.$reset();
    };

    const resetCoursePaymentEditionModal = () => {
      editedCoursePayment.value = { _id: '', nature: '', type: '', netInclTaxes: '', date: '' };
      coursePaymentMetaInfo.value = { number: '', courseName: '', netInclTaxes: '' };
      validations.value.editedCoursePayment.$reset();
    };

    const getItemType = item => (item.type
      ? PAYMENT_OPTIONS.find(option => option.value === item.type).label
      : CREDIT_OPTION.label);

    const getSortedItems = bill => (bill.courseCreditNote
      ? [...bill.coursePayments, bill.courseCreditNote].sort((a, b) => ascendingSort(a.date, b.date))
      : bill.coursePayments.sort((a, b) => ascendingSort(a.date, b.date)));

    const getTotal = (bills) => {
      const total = bills.reduce((acc, val) => acc + val.total, 0);

      return formatPriceWithSign(total);
    };

    const created = async () => {
      refreshCourseBills();
    };

    created();

    return {
      // Data
      courseBills,
      columns,
      pagination,
      loading,
      pdfLoading,
      coursePaymentMetaInfo,
      coursePaymentCreationModal,
      coursePaymentEditionModal,
      newCoursePayment,
      editedCoursePayment,
      paymentCreationLoading,
      paymentEditionLoading,
      PAYMENT_OPTIONS,
      REFUND,
      // Computed
      validations,
      // Methods
      refreshCourseBills,
      formatPrice,
      downloadBill,
      openCoursePaymentCreationModal,
      openCoursePaymentEditionModal,
      createPayment,
      editPayment,
      resetCoursePaymentCreationModal,
      resetCoursePaymentEditionModal,
      getItemType,
      getSortedItems,
      getTotal,
      get,
      formatDate,
    };
  },
};
</script>

<style lang="sass" scoped>
.program
  max-width: fit-content
  flex: 1
  color: $copper-grey-600
.misc
  width: max-content
  padding-left: 4px
  color: $copper-grey-600
.add-payment
  background-color: $copper-grey-500
  width: 20px
  height: 20px
  justify-content: center
.cell
  padding: 0
  width: 100%
.date
  min-width: 10%
  padding: 4px
.payment
  width: 30%
  padding: 4px
.paid
  min-width: 10%
  padding: 4px
  justify-content: center
  display: flex
.area
  @media screen and (max-width: 767px)
    width: 27%
  @media screen and (min-width: 768px)
    width: 25%
  padding: 4px 8px
.edit
  @media screen and (max-width: 767px)
    width: 20%
  @media screen and (min-width: 768px)
    width: 25%
  padding: 4px 8px
  justify-content: flex-end
  display: flex
</style>
