<template>
  <div>
    <div class="q-mt-lg q-mb-xl">
      <p v-if="course.type === INTER_B2B" class="text-weight-bold">
        {{ company.name }}
        <span class="text-weight-regular text-copper-500">
           ( <a class="redirection cursor-pointer" @click="goToCompany">voir la fiche structure</a> )
        </span>
      </p>
      <div v-if="courseBills.length">
        <p v-if="course.type === INTRA" class="text-weight-bold">
          Infos de facturation - {{ company.name }}
          <span class="text-weight-regular text-copper-500">
            ( <a class="redirection cursor-pointer" @click="goToCompany">voir la fiche structure</a> )
          </span>
        </p>
        <q-card v-for="bill of courseBills" :key="bill._id" flat class="q-mb-md">
          <q-card-section class="cursor-pointer row items-center" :id="bill._id" @click="showDetails(bill._id)">
            <q-item-section>
              <div class="flex">
                <div v-if="bill.number" class="text-weight-bold clickable-name" @click.stop="downloadBill(bill)"
                  :disable="pdfLoading">
                  {{ bill.number }} - {{ formatPrice(bill.netInclTaxes) }}
                </div>
                <div v-else class="text-weight-bold">
                  A facturer - {{ formatPrice(bill.netInclTaxes) }}
                </div>
                <div class="q-ml-lg bill-cancel" v-if="bill.courseCreditNote">
                  <q-icon size="12px" name="fas fa-times-circle" color="orange-500 attendance" />
                  <div class="q-ml-xs text-orange-500">
                    Annulée par avoir -
                    <span class="clickable-name text-orange-500" :disable="pdfLoading"
                      @click.stop="downloadCreditNote(bill.courseCreditNote)">
                      {{ bill.courseCreditNote.number }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="isPayerVisible(bill)" @click.stop="openPayerEditionModal(bill)" class="payer">
                Payeur : {{ get(bill, 'payer.name') }}
                <q-icon v-if="!isBilled(bill)" size="16px" name="edit" color="copper-grey-500" />
              </div>
              {{ isDateVisible(bill) ? `Date : ${CompaniDate(bill.billedAt).format(DD_MM_YYYY)}` : '' }}
            </q-item-section>
            <q-icon size="24px" :name="areDetailsVisible[bill._id] ? 'expand_less' : 'expand_more'" />
          </q-card-section>
          <div class="bg-peach-200 q-pt-sm" v-if="areDetailsVisible[bill._id]">
            <q-card flat class="q-mx-lg q-mb-sm">
              <q-card-section class="fee">
                <div class="fee-info">
                  <div class="text-copper-500">{{ get(course, 'subProgram.program.name') }}</div>
                  <div>Prix unitaire : {{ formatPrice(get(bill, 'mainFee.price')) }}</div>
                  <div>Quantité : {{ get(bill, 'mainFee.count') }}</div>
                  <div v-if="get(bill, 'mainFee.description')" class="ellipsis">
                    Description : {{ bill.mainFee.description }}
                  </div>
                </div>
                <ni-button icon="edit" @click="openMainFeeEditionModal(bill)" />
              </q-card-section>
            </q-card>
            <div v-for="billingPurchase of bill.billingPurchaseList" :key="billingPurchase._id">
              <q-card flat class="q-mx-lg q-mb-sm">
                <q-card-section class="fee">
                  <div class="fee-info">
                    <div class="text-copper-500">
                      {{ getBillingItemName(billingPurchase.billingItem) }}
                    </div>
                    <div>Prix unitaire : {{ formatPrice(billingPurchase.price) }}</div>
                    <div>Quantité : {{ billingPurchase.count }}</div>
                    <div v-if="billingPurchase.description" class="ellipsis">
                      Description : {{ billingPurchase.description }}
                    </div>
                  </div>
                  <div>
                    <ni-button icon="edit" @click="openBillingPurchaseEditionModal(bill, billingPurchase)" />
                    <ni-button v-if="!isBilled(bill)" icon="delete"
                      @click="validatePurchaseDeletion(bill._id, billingPurchase._id)" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="row justify-end q-pa-sm">
              <ni-button v-if="!isBilled(bill)" color="primary" icon="add" label="Ajouter un article"
                :disable="billingPurchaseCreationLoading" @click="openBillingPurchaseAdditionModal(bill._id)" />
              <ni-button v-else-if="!bill.courseCreditNote" color="primary" :disable="creditNoteCreationLoading"
                @click="openCreditNoteCreationModal(bill)" label="Faire un avoir" icon="mdi-credit-card-refund" />
            </div>
            <div v-if="!isBilled(bill)" class="row justify-end q-px-lg q-py-sm">
              <ni-button label="Facturer" color="white" class="bg-primary" icon="payment"
                @click="openCourseBillValidationModal(bill._id)" :disable="billValidationLoading" />
            </div>
          </div>
        </q-card>
      </div>
      <div v-if="canAddBill" class="row justify-start">
        <ni-button label="Créer une facture" color="white" class="bg-primary" icon="payment" :loading="loading"
          @click="openBillCreationModal" :disable="billCreationLoading" />
      </div>
    </div>

    <ni-bill-creation-modal v-model="billCreationModal" v-model:new-bill="newBill" :course-name="courseName"
      @submit="addBill" :validations="validations.newBill" @hide="resetBillCreationModal" :loading="billCreationLoading"
      :payer-options="payerList" :error-messages="newBillErrorMessages" :trainees-quantity="traineesQuantity"
      :course-type="course.type" />

    <ni-payer-edition-modal v-model="payerEditionModal" v-model:edited-payer="editedBill.payer" @submit="editBill"
       @hide="resetEditedBill" :loading="billEditionLoading" :payer-options="payerList" :course-name="courseName" />

    <!-- main fee edition modal -->
    <ni-course-fee-edition-modal v-model="mainFeeEditionModal" v-model:course-fee="editedBill.mainFee"
      @submit="editBill" :validations="validations.editedBill.mainFee" @hide="resetMainFeeEditionModal"
      :loading="billEditionLoading" :error-messages="mainFeeErrorMessages" :course-name="courseName"
      :title="courseFeeEditionModalMetaInfo.title" :is-billed="courseFeeEditionModalMetaInfo.isBilled" />

    <ni-billing-purchase-addition-modal v-model="billingPurchaseAdditionModal" :course-name="courseName"
      v-model:new-billing-purchase="newBillingPurchase" @submit="addBillingPurchase"
      :validations="validations.newBillingPurchase" @hide="resetBillingPurchaseAdditionModal"
      :loading="billingPurchaseCreationLoading" :billing-item-options="billingItemList"
      :error-messages="newBillingPurchaseErrorMessages" />

    <!-- billing purchase edition modal -->
    <ni-course-fee-edition-modal v-model="billingPurchaseEditionModal" :validations="validations.editedBillingPurchase"
      v-model:course-fee="editedBillingPurchase" :title="courseFeeEditionModalMetaInfo.title"
      @submit="editBillingPurchase" :loading="billingPurchaseEditionLoading" @hide="resetBillingPurchaseEditionModal"
      :error-messages="editedBillingPurchaseErrorMessages" :is-billed="courseFeeEditionModalMetaInfo.isBilled"
      :course-name="courseName" />

    <ni-course-bill-validation-modal v-model="courseBillValidationModal" v-model:bill-to-validate="billToValidate"
      @submit="validateBill" @hide="resetCourseBillValidationModal" :loading="billValidationLoading"
      :validations="validations.billToValidate" @cancel="cancelBillValidation" :trainees-length="traineesLength"
      :course-name="courseName" :course-type="course.type" />

    <ni-course-credit-note-creation-modal v-model="creditNoteCreationModal" v-model:new-credit-note="newCreditNote"
      @submit="addCreditNote" @hide="resetCreditNoteCreationModal" :loading="creditNoteCreationLoading"
      :validations="validations.newCreditNote" :min-date="minCourseCreditNoteDate"
      :credit-note-meta-info="creditNoteMetaInfo" :validated-course-bills-count="validatedCourseBillsCount"
      :display-validated-course-bills-count="displayValidatedCourseBillsCount" />
  </div>
</template>

<script>
import { useMeta, useQuasar } from 'quasar';
import { computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import { strictPositiveNumber, integerNumber, minDate } from '@helpers/vuelidateCustomVal';
import { formatPrice, formatDownloadName, formatQuantity } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import CompaniDate from '@helpers/dates/companiDates';
import { descendingSortBy } from '@helpers/dates/utils';
import CourseBills from '@api/CourseBills';
import CourseCreditNotes from '@api/CourseCreditNotes';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import { REQUIRED_LABEL, COMPANY, INTRA, INTER_B2B, DD_MM_YYYY } from '@data/constants';
import BillCreationModal from 'src/modules/vendor/components/billing/CourseBillCreationModal';
import PayerEditionModal from 'src/modules/vendor/components/billing/PayerEditionModal';
import CourseFeeEditionModal from 'src/modules/vendor/components/billing/CourseFeeEditionModal';
import BillingPurchaseAdditionModal from 'src/modules/vendor/components/billing/BillingPurchaseAdditionModal';
import CourseBillValidationModal from 'src/modules/vendor/components/billing/CourseBillValidationModal';
import CourseCreditNoteCreationModal from 'src/modules/vendor/components/billing/CourseCreditNoteCreationModal';

export default {
  name: 'CourseBillingCard',
  props: {
    company: { type: Object, default: () => ({}) },
    course: { type: Object, default: () => ({}) },
    payerList: { type: Array, default: () => ([]) },
    billingItemList: { type: Array, default: () => ([]) },
    courseBills: { type: Array, default: () => ([]) },
    loading: { type: Boolean, default: false },
    expectedBillsCountInvalid: { type: Boolean, default: false },
  },
  emits: ['refresh-course-bills', 'refresh-and-unroll'],
  components: {
    'ni-bill-creation-modal': BillCreationModal,
    'ni-payer-edition-modal': PayerEditionModal,
    'ni-course-fee-edition-modal': CourseFeeEditionModal,
    'ni-billing-purchase-addition-modal': BillingPurchaseAdditionModal,
    'ni-course-bill-validation-modal': CourseBillValidationModal,
    'ni-course-credit-note-creation-modal': CourseCreditNoteCreationModal,
    'ni-button': Button,
  },
  setup (props, { emit }) {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);
    const $q = useQuasar();
    const $router = useRouter();

    const { company, course, payerList, billingItemList, courseBills, expectedBillsCountInvalid } = toRefs(props);
    const billCreationLoading = ref(false);
    const billEditionLoading = ref(false);
    const billingPurchaseCreationLoading = ref(false);
    const billingPurchaseEditionLoading = ref(false);
    const billValidationLoading = ref(false);
    const creditNoteCreationLoading = ref(false);
    const pdfLoading = ref(false);
    const billCreationModal = ref(false);
    const payerEditionModal = ref(false);
    const mainFeeEditionModal = ref(false);
    const billingPurchaseAdditionModal = ref(false);
    const billingPurchaseEditionModal = ref(false);
    const courseBillValidationModal = ref(false);
    const creditNoteCreationModal = ref(false);
    const newBill = ref({ payer: '', mainFee: { price: 0, count: 1 } });
    const editedBill = ref({ _id: '', payer: '', mainFee: { price: '', description: '', count: '' } });
    const newBillingPurchase = ref({ billId: '', billingItem: '', price: 0, count: 1, description: '' });
    const editedBillingPurchase = ref({ _id: '', billId: '', price: 0, count: 1, description: '' });
    const newCreditNote = ref({ courseBill: '', misc: '', date: '', company: '' });
    const creditNoteMetaInfo = ref({ number: '', netInclTaxes: '', courseName: '' });
    const areDetailsVisible = ref(Object.fromEntries(courseBills.value.map(bill => [bill._id, false])));
    const billToValidate = ref({ _id: '', billedAt: '' });
    const courseFeeEditionModalMetaInfo = ref({ title: '', isBilled: false });
    const minCourseCreditNoteDate = ref('');

    const rules = computed(() => ({
      newBill: {
        mainFee: {
          price: { required, strictPositiveNumber },
          count: { required, strictPositiveNumber, integerNumber },
        },
      },
      editedBill: {
        mainFee: {
          price: { required, strictPositiveNumber },
          count: { required, strictPositiveNumber, integerNumber },
        },
      },
      newBillingPurchase: {
        billingItem: { required },
        price: { required, strictPositiveNumber },
        count: { required, strictPositiveNumber, integerNumber },
      },
      editedBillingPurchase: {
        price: { required, strictPositiveNumber },
        count: { required, strictPositiveNumber, integerNumber },
      },
      billToValidate: {
        billedAt: { required },
      },
      newCreditNote: {
        courseBill: { required },
        date: { required, minDate: minDate(minCourseCreditNoteDate.value) },
        company: { required },
      },
    }));
    const validations = useVuelidate(rules, {
      newBill,
      editedBill,
      newBillingPurchase,
      editedBillingPurchase,
      billToValidate,
      newCreditNote,
    });

    const newBillErrorMessages = computed(() => getBillErrorMessages('newBill.mainFee'));

    const mainFeeErrorMessages = computed(() => getBillErrorMessages('editedBill.mainFee'));

    const newBillingPurchaseErrorMessages = computed(() => getBillErrorMessages('newBillingPurchase'));

    const editedBillingPurchaseErrorMessages = computed(() => getBillErrorMessages('editedBillingPurchase'));

    const validatedCourseBillsCount = computed(() => courseBills.value
      .filter(cb => cb.billedAt && !cb.courseCreditNote)
      .length);

    const traineesLength = computed(() => course.value.trainees
      .filter(trainee => trainee.company === company.value._id)
      .length);

    const courseName = computed(() => `${get(company, 'value.name')} - ${get(course, 'value.subProgram.program.name')}
      ${get(course, 'value.misc') ? ` - ${get(course, 'value.misc')}` : ''}`);

    const traineesQuantity = computed(() => {
      const quantity = get(course, 'value.trainees').filter(trainee => trainee.company === company.value._id).length;

      return `${formatQuantity('stagiaire', quantity)} de ${get(company, 'value.name')}
        ${quantity > 1 ? 'inscrits' : 'inscrit'} à cette formation`;
    });

    const getBillErrorMessages = (parent) => {
      let price = '';
      let count = '';
      if (get(validations, `value.${parent}.price.required.$response`) === false) price = REQUIRED_LABEL;
      if (get(validations, `value.${parent}.price.strictPositiveNumber.$response`) === false) {
        price = 'Prix non valide';
      }

      if (get(validations, `value.${parent}.count.required.$response`) === false) count = REQUIRED_LABEL;
      if (get(validations, `value.${parent}.count.strictPositiveNumber.$response`) === false ||
        get(validations, `value.${parent}.count.integerNumber.$response`) === false) {
        count = 'Nombre non valide';
      }

      return { price, count };
    };

    const openBillCreationModal = () => {
      if (expectedBillsCountInvalid.value) return NotifyWarning('Champ(s) invalide(s).');

      const courseBillsWithoutCreditNote = courseBills.value.filter(cb => !cb.courseCreditNote);
      if (course.value.type === INTRA && courseBillsWithoutCreditNote.length === course.value.expectedBillsCount) {
        return NotifyWarning('Impossible de créer une facture, nombre de factures maximum atteint.');
      }

      billCreationModal.value = true;
    };

    const displayValidatedCourseBillsCount = computed(() => course.value.type === INTRA &&
      course.value.expectedBillsCount > 1);

    const setEditedBill = (bill) => {
      const payer = get(bill, 'payer._id');
      editedBill.value = {
        _id: bill._id,
        payer,
        mainFee: { price: bill.mainFee.price, count: bill.mainFee.count, description: bill.mainFee.description },
      };
    };

    const openPayerEditionModal = (bill) => {
      if (isBilled(bill)) return null;

      setEditedBill(bill);
      payerEditionModal.value = true;
    };

    const openMainFeeEditionModal = (bill) => {
      setEditedBill(bill);
      courseFeeEditionModalMetaInfo.value = {
        title: get(course, 'value.subProgram.program.name'),
        isBilled: isBilled(bill),
      };
      mainFeeEditionModal.value = true;
    };

    const openBillingPurchaseAdditionModal = (billId) => {
      newBillingPurchase.value.billId = billId;
      billingPurchaseAdditionModal.value = true;
    };

    const openBillingPurchaseEditionModal = (bill, billingPurchase) => {
      editedBillingPurchase.value = {
        _id: billingPurchase._id,
        billId: bill._id,
        price: billingPurchase.price,
        count: billingPurchase.count,
        description: billingPurchase.description,
      };
      courseFeeEditionModalMetaInfo.value = {
        title: getBillingItemName(billingPurchase.billingItem),
        isBilled: isBilled(bill),
      };
      billingPurchaseEditionModal.value = true;
    };

    const openCourseBillValidationModal = (billId) => {
      billToValidate.value._id = billId;
      courseBillValidationModal.value = true;
    };

    const resetBillCreationModal = () => {
      newBill.value = { payer: '', mainFee: { price: 0, count: 1 } };
      validations.value.newBill.$reset();
    };

    const resetEditedBill = () => {
      editedBill.value = { _id: '', payer: '', mainFee: { price: '', description: '', count: '' } };
      validations.value.editedBill.$reset();
    };

    const resetMainFeeEditionModal = () => {
      resetEditedBill();
      courseFeeEditionModalMetaInfo.value = { title: '', isBilled: false };
    };

    const resetBillingPurchaseAdditionModal = () => {
      newBillingPurchase.value = { billId: '', billingItem: '', price: 0, count: 1, description: '' };
      validations.value.newBillingPurchase.$reset();
    };

    const resetBillingPurchaseEditionModal = () => {
      editedBillingPurchase.value = { billId: '', price: 0, count: 1, description: '' };
      validations.value.editedBillingPurchase.$reset();
      courseFeeEditionModalMetaInfo.value = { title: '', isBilled: false };
    };

    const resetCourseBillValidationModal = () => {
      billToValidate.value = { _id: '', billedAt: '' };
      validations.value.billToValidate.$reset();
    };

    const formatPayerForPayload = (payloadPayer) => {
      const payerType = payerList.value.find(payer => payer.value === payloadPayer).type;

      return payerType === COMPANY ? { company: payloadPayer } : { fundingOrganisation: payloadPayer };
    };

    const formatCreationPayload = () => ({
      course: course.value._id,
      mainFee: newBill.value.mainFee,
      company: company.value._id,
      payer: formatPayerForPayload(newBill.value.payer),
    });

    const unrollBill = () => {
      const bill = [...courseBills.value].sort(descendingSortBy('createdAt'))[0];
      showDetails(bill._id);
    };

    const addBill = async () => {
      try {
        validations.value.newBill.$touch();
        if (validations.value.newBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        billCreationLoading.value = true;
        await CourseBills.create(formatCreationPayload());
        NotifyPositive('Facture créée.');

        billCreationModal.value = false;
        await emit('refresh-and-unroll', () => { unrollBill(); });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la facture.');
      } finally {
        billCreationLoading.value = false;
      }
    };

    const editBill = async () => {
      try {
        validations.value.editedBill.$touch();
        if (validations.value.editedBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        billEditionLoading.value = true;
        await CourseBills.update(
          editedBill.value._id,
          { payer: formatPayerForPayload(editedBill.value.payer), mainFee: editedBill.value.mainFee }
        );
        NotifyPositive('Facture modifiée.');

        payerEditionModal.value = false;
        mainFeeEditionModal.value = false;
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la facture.');
      } finally {
        billEditionLoading.value = false;
      }
    };

    const addBillingPurchase = async () => {
      try {
        validations.value.newBillingPurchase.$touch();
        if (validations.value.newBillingPurchase.$error) return NotifyWarning('Champ(s) invalide(s)');

        billingPurchaseCreationLoading.value = true;

        await CourseBills
          .addBillingPurchase(newBillingPurchase.value.billId, pickBy(omit(newBillingPurchase.value, 'billId')));
        NotifyPositive('Article ajouté.');

        billingPurchaseAdditionModal.value = false;
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\'article.');
      } finally {
        billingPurchaseCreationLoading.value = false;
      }
    };

    const editBillingPurchase = async () => {
      try {
        validations.value.editedBillingPurchase.$touch();
        if (validations.value.editedBillingPurchase.$error) return NotifyWarning('Champ(s) invalide(s)');

        billingPurchaseEditionLoading.value = true;

        const { _id: purchaseId, billId, price, count, description } = editedBillingPurchase.value;
        await CourseBills.updateBillingPurchase(billId, purchaseId, { price, count, description });
        NotifyPositive('Article modifié.');

        billingPurchaseEditionModal.value = false;
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'article.');
      } finally {
        billingPurchaseEditionLoading.value = false;
      }
    };

    const deleteBillingPurchase = async (billId, purchaseId) => {
      try {
        await CourseBills.deleteBillingPurchase(billId, purchaseId);

        NotifyPositive('Article supprimé.');
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'article.');
      }
    };

    const validatePurchaseDeletion = (billId, purchaseId) => {
      $q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cet article&nbsp;?',
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => deleteBillingPurchase(billId, purchaseId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    };

    const openCreditNoteCreationModal = (bill) => {
      if (expectedBillsCountInvalid.value) return NotifyWarning('Champ(s) invalide(s).');
      const { _id: billId, number, netInclTaxes } = bill;
      newCreditNote.value = {
        courseBill: billId,
        date: '',
        misc: '',
        company: company.value._id,
      };
      creditNoteCreationModal.value = true;
      minCourseCreditNoteDate.value = bill.billedAt;
      creditNoteMetaInfo.value = {
        number,
        netInclTaxes,
        courseName: `${get(company, 'value.name')} - ${get(course, 'value.subProgram.program.name')}
          ${get(course, 'value.misc') ? ` - ${get(course, 'value.misc')}` : ''}`,
      };
    };

    const addCreditNote = async () => {
      try {
        validations.value.newCreditNote.$touch();
        if (validations.value.newCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        creditNoteCreationLoading.value = true;

        await CourseCreditNotes.create(newCreditNote.value);
        NotifyPositive('Avoir créé.');

        creditNoteCreationModal.value = false;
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'avoir.');
      } finally {
        creditNoteCreationLoading.value = false;
      }
    };

    const resetCreditNoteCreationModal = () => {
      newCreditNote.value = { courseBill: '', date: '', misc: '', company: '' };
      minCourseCreditNoteDate.value = '';
      creditNoteMetaInfo.value = { number: '', netInclTaxes: '', courseName: '' };
      validations.value.newCreditNote.$reset();
    };

    const validateBill = async () => {
      try {
        validations.value.billToValidate.$touch();
        if (validations.value.billToValidate.$error) return NotifyWarning('Champ(s) invalide(s)');

        billValidationLoading.value = true;

        await CourseBills.update(billToValidate.value._id, { billedAt: billToValidate.value.billedAt });
        NotifyPositive('Facture validée.');

        courseBillValidationModal.value = false;
        await emit('refresh-course-bills');
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la validation de la facture.');
      } finally {
        billValidationLoading.value = false;
      }
    };

    const cancelBillValidation = () => {
      resetBillCreationModal();
      courseBillValidationModal.value = false;
      NotifyPositive('Validation de la facture annulée.');
    };

    const isBilled = bill => !!bill.billedAt;

    const canAddBill = computed(() => course.value.type === INTRA ||
      courseBills.value.every(bill => bill.courseCreditNote));

    const showDetails = (billId) => {
      areDetailsVisible.value[billId] = !areDetailsVisible.value[billId];
    };

    const isPayerVisible = bill => !bill.courseCreditNote || areDetailsVisible.value[bill._id];

    const isDateVisible = bill => isPayerVisible(bill) && bill.billedAt;

    const getBillingItemName = billingItem => billingItemList.value.find(item => item.value === billingItem).label;

    const downloadBill = async (bill) => {
      try {
        pdfLoading.value = true;
        const pdf = await CourseBills.getPdf(bill._id);
        const pdfName = `${formatDownloadName(`${bill.payer.name} ${bill.number}`)}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la facture.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const downloadCreditNote = async (creditNote) => {
      try {
        pdfLoading.value = true;
        const pdf = await CourseCreditNotes.getPdf(creditNote._id);
        const { payer } = courseBills.value.find(bill => bill._id === creditNote.courseBill);
        const pdfName = `${formatDownloadName(`${payer.name} ${creditNote.number}`)}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de l\'avoir.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const goToCompany = () => {
      $router.push({
        name: 'ni users companies info',
        params: { companyId: company.value._id },
        query: { defaultTab: 'bills' },
      });
    };

    return {
      // Data
      billCreationLoading,
      billEditionLoading,
      pdfLoading,
      billingPurchaseCreationLoading,
      billingPurchaseEditionLoading,
      creditNoteCreationLoading,
      billValidationLoading,
      billCreationModal,
      payerEditionModal,
      mainFeeEditionModal,
      billingPurchaseAdditionModal,
      billingPurchaseEditionModal,
      creditNoteCreationModal,
      courseBillValidationModal,
      newBill,
      newBillingPurchase,
      editedBillingPurchase,
      editedBill,
      newCreditNote,
      billToValidate,
      courseFeeEditionModalMetaInfo,
      areDetailsVisible,
      minCourseCreditNoteDate,
      creditNoteMetaInfo,
      INTRA,
      INTER_B2B,
      DD_MM_YYYY,
      // Computed
      validations,
      newBillErrorMessages,
      mainFeeErrorMessages,
      newBillingPurchaseErrorMessages,
      editedBillingPurchaseErrorMessages,
      canAddBill,
      traineesLength,
      courseName,
      traineesQuantity,
      validatedCourseBillsCount,
      displayValidatedCourseBillsCount,
      // Methods
      resetBillCreationModal,
      resetEditedBill,
      resetMainFeeEditionModal,
      resetBillingPurchaseAdditionModal,
      resetBillingPurchaseEditionModal,
      resetCreditNoteCreationModal,
      resetCourseBillValidationModal,
      addBill,
      editBill,
      addBillingPurchase,
      editBillingPurchase,
      addCreditNote,
      validateBill,
      cancelBillValidation,
      isBilled,
      getBillErrorMessages,
      openBillCreationModal,
      openPayerEditionModal,
      openMainFeeEditionModal,
      openBillingPurchaseAdditionModal,
      openBillingPurchaseEditionModal,
      openCreditNoteCreationModal,
      openCourseBillValidationModal,
      validatePurchaseDeletion,
      isDateVisible,
      isPayerVisible,
      showDetails,
      getBillingItemName,
      downloadBill,
      downloadCreditNote,
      goToCompany,
      get,
      omit,
      pickBy,
      formatPrice,
      CompaniDate,
    };
  },
};
</script>

<style lang="sass" scoped>
.payer
  width: fit-content

.fee
  display: flex
  justify-content: space-between
  align-items: flex-start
  &-info
    max-width: 90%

.bill-cancel
  display: flex
  align-items: center

.redirection
  &:hover
    text-decoration: underline
    text-decoration-color: $copper-500
</style>
