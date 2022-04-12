<template>
  <q-page class="vendor-background q-pb-xl">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Suivi des factures</p>
      <ni-expanding-table :data="courseBills" :columns="columns" v-model:pagination="pagination" :hide-bottom="false"
        :loading="loading">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'number'">
              <div class="cliquable-name" @click="downloadBill(props.row._id)" :disable="pdfLoading">
                {{ col.value }}
              </div>
              <div class="flex">
                <div class="program ellipsis">{{ `${get(props.row, 'course.subProgram.program.name')}` }}</div>
                <div v-if="get(props.row, 'course.misc')" class="misc">- {{ get(props.row, 'course.misc') }}</div>
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
          <q-td colspan="100%">
            <div v-if="!props.row.coursePayments.length" class="text-italic text-center">
              Aucun règlement renseigné.
            </div>
            <div v-else v-for="coursePayment in getSortedPayments(props.row.coursePayments)" :key="coursePayment._id"
              :props="props" class="q-my-sm expanding-table-expanded-row">
              <div>
                {{ formatDate(coursePayment.date) }}
                {{ coursePayment.number }}
                ({{ getPaymentType(coursePayment.type) }})
              </div>
              <div>{{ formatPrice(coursePayment.netInclTaxes) }}</div>
              <q-icon size="16px" name="edit" color="copper-grey-500"
                @click="openCoursePaymentEditionModal(props.row, coursePayment)" />
            </div>
          </q-td>
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
import { BALANCE, PAYMENT, PAYMENT_OPTIONS } from '@data/constants.js';
import { formatDate, ascendingSort } from '@helpers/date';
import { downloadFile } from '@helpers/file';
import { formatPrice, readAPIResponseWithTypeArrayBuffer } from '@helpers/utils';
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
      },
      { name: 'number', label: '#', field: 'number', align: 'left', style: 'max-width: 250px' },
      {
        name: 'progress',
        label: 'Avancement formation',
        field: 'progress',
        align: 'center',
        style: 'min-width: 150px; width: 20%',
      },
      { name: 'netInclTaxes', label: 'Montant', field: 'netInclTaxes', format: formatPrice, align: 'center' },
      { name: 'payment', label: '', align: 'center', field: val => val.coursePayments || '' },
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

    const getPaymentType = type => PAYMENT_OPTIONS.find(option => option.value === type).label;

    const getSortedPayments = payments => payments.sort((a, b) => ascendingSort(a.date, b.date));

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
      getPaymentType,
      getSortedPayments,
      get,
      formatDate,
    };
  },
};
</script>

<style lang="sass" scoped>
.cliquable-name
  text-decoration: underline
  color: $primary
  width: fit-content
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
</style>
