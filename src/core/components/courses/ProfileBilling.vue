<template>
  <div>
    <div v-if="!billsLoading" class="q-mt-lg q-mb-xl">
      <div v-if="courseBills.length">
        <p class="text-weight-bold">Infos de facturation</p>
        <q-card v-for="bill of courseBills" :key="bill._id" flat class="q-mb-md">
          <q-card-section class="cursor-pointer row items-center" :id="bill._id" @click="showDetails(bill._id)">
            <q-item-section>
              <div class="flex">
                <div v-if="bill.number" class="text-weight-bold cliquable-name" @click.stop="downloadBill(bill._id)"
                  :disable="pdfLoading">
                  {{ bill.number }} - {{ formatPrice(bill.netInclTaxes) }}
                </div>
                <div v-else class="text-weight-bold">
                  A facturer - {{ formatPrice(bill.netInclTaxes) }}
                </div>
                <div class="q-ml-lg bill-cancel" v-if="bill.courseCreditNote">
                  <q-icon size="12px" name="fas fa-times-circle" color="orange-500 attendance" />
                  <div class="q-ml-xs text-orange-500">
                    Annulée par avoir - {{ bill.courseCreditNote.number }}
                  </div>
                </div>
              </div>
              <div v-if="isFunderVisible(bill)" @click.stop="openFunderEditionModal(bill)" class="payer">
                Payeur : {{ get(bill, 'courseFundingOrganisation.name') || get(bill, 'company.name') }}
                <q-icon v-if="!isBilled(bill)" size="16px" name="edit" color="copper-grey-500" />
              </div>
              {{ isDateVisible(bill) ? `Date : ${formatDate(bill.billedAt)}` : '' }}
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
      <div v-if="canAddBill" class="row justify-end">
        <ni-button label="Créer une facture" color="white" class="bg-primary" icon="payment"
          @click="openBillCreationModal" :disable="billCreationLoading" />
      </div>
    </div>
    <div v-else class="row justify-center q-mt-md"><q-spinner size="30px" /></div>

    <ni-bill-creation-modal v-model="billCreationModal" v-model:new-bill="newBill"
      @submit="addBill" :validations="validations.newBill" @hide="resetBillCreationModal"
      :loading="billCreationLoading" :payer-options="payerList" :error-messages="newBillErrorMessages" />

    <ni-funder-edition-modal v-model="funderEditionModal" v-model:edited-funder="editedBill.funder"
      @submit="editBill" @hide="resetEditedBill" :loading="billEditionLoading" :payer-options="payerList" />

    <!-- main fee edition modal -->
    <ni-course-fee-edition-modal v-model="mainFeeEditionModal" v-model:course-fee="editedBill.mainFee"
      @submit="editBill" :validations="validations.editedBill.mainFee" @hide="resetMainFeeEditionModal"
      :loading="billEditionLoading" :error-messages="mainFeeErrorMessages"
      :title="courseFeeEditionModalMetaInfo.title" :is-billed="courseFeeEditionModalMetaInfo.isBilled" />

    <ni-billing-purchase-addition-modal v-model="billingPurchaseAdditionModal"
      v-model:new-billing-purchase="newBillingPurchase" @submit="addBillingPurchase"
      :validations="validations.newBillingPurchase" @hide="resetBillingPurchaseAdditionModal"
      :loading="billingPurchaseCreationLoading" :billing-item-options="billingItemList"
      :error-messages="newBillingPurchaseErrorMessages" />

    <!-- billing purchase edition modal -->
    <ni-course-fee-edition-modal v-model="billingPurchaseEditionModal" :validations="validations.editedBillingPurchase"
      v-model:course-fee="editedBillingPurchase" :title="courseFeeEditionModalMetaInfo.title"
      @submit="editBillingPurchase" :loading="billingPurchaseEditionLoading" @hide="resetBillingPurchaseEditionModal"
      :error-messages="editedBillingPurchaseErrorMessages" :is-billed="courseFeeEditionModalMetaInfo.isBilled" />

    <ni-course-bill-validation-modal v-model="courseBillValidationModal" v-model:bill-to-validate="billToValidate"
      @submit="validateBill" @hide="resetCourseBillValidationModal" :loading="billValidationLoading"
      :validations="validations.billToValidate" @cancel="cancelBillValidation" />

    <ni-course-credit-note-creation-modal v-model="creditNoteCreationModal" v-model:new-credit-note="newCreditNote"
      @submit="addCreditNote" @hide="resetCreditNoteCreationModal" :loading="creditNoteCreationLoading"
      :validations="validations.newCreditNote" :min-date="minCourseCreditNoteDate" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useMeta, useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import { strictPositiveNumber, integerNumber } from '@helpers/vuelidateCustomVal';
import { formatAndSortOptions, formatPrice, readAPIResponseWithTypeArrayBuffer } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import { downloadFile } from '@helpers/file';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import CourseBillingItems from '@api/CourseBillingItems';
import CourseCreditNotes from '@api/CourseCreditNotes';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import { REQUIRED_LABEL, LIST } from '@data/constants';
import BillCreationModal from 'src/modules/vendor/components/billing/CourseBillCreationModal';
import FunderEditionModal from 'src/modules/vendor/components/billing/FunderEditionModal';
import CourseFeeEditionModal from 'src/modules/vendor/components/billing/CourseFeeEditionModal';
import BillingPurchaseAdditionModal from 'src/modules/vendor/components/billing/BillingPurchaseAdditionModal';
import CourseBillValidationModal from 'src/modules/vendor/components/billing/CourseBillValidationModal';
import CourseCreditNoteCreationModal from 'src/modules/vendor/components/billing/CourseCreditNoteCreationModal';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-bill-creation-modal': BillCreationModal,
    'ni-funder-edition-modal': FunderEditionModal,
    'ni-course-fee-edition-modal': CourseFeeEditionModal,
    'ni-billing-purchase-addition-modal': BillingPurchaseAdditionModal,
    'ni-course-bill-validation-modal': CourseBillValidationModal,
    'ni-course-credit-note-creation-modal': CourseCreditNoteCreationModal,
    'ni-button': Button,
  },
  setup () {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);
    const $store = useStore();
    const $q = useQuasar();

    const billCreationLoading = ref(false);
    const billEditionLoading = ref(false);
    const billingPurchaseCreationLoading = ref(false);
    const billingPurchaseEditionLoading = ref(false);
    const billValidationLoading = ref(false);
    const creditNoteCreationLoading = ref(false);
    const billsLoading = ref(false);
    const pdfLoading = ref(false);
    const payerList = ref([]);
    const courseBills = ref([]);
    const billingItemList = ref([]);
    const billCreationModal = ref(false);
    const funderEditionModal = ref(false);
    const mainFeeEditionModal = ref(false);
    const billingPurchaseAdditionModal = ref(false);
    const billingPurchaseEditionModal = ref(false);
    const courseBillValidationModal = ref(false);
    const creditNoteCreationModal = ref(false);
    const newBill = ref({ funder: '', mainFee: { price: 0, count: 1 } });
    const editedBill = ref({ _id: '', funder: '', mainFee: { price: '', description: '', count: '' } });
    const newBillingPurchase = ref({ billId: '', billingItem: '', price: 0, count: 1, description: '' });
    const editedBillingPurchase = ref({ _id: '', billId: '', price: 0, count: 1, description: '' });
    const newCreditNote = ref({ courseBill: '', misc: '', date: '', company: '' });
    const areDetailsVisible = ref(Object.fromEntries(courseBills.value.map(bill => [bill._id, false])));
    const billToValidate = ref({ _id: '', billedAt: '' });
    const courseFeeEditionModalMetaInfo = ref({ title: '', isBilled: false });
    const minCourseCreditNoteDate = ref('');

    const rules = {
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
        date: { required },
        company: { required },
      },
    };
    const validations = useVuelidate(rules, {
      newBill,
      editedBill,
      newBillingPurchase,
      editedBillingPurchase,
      billToValidate,
      newCreditNote,
    });

    const course = computed(() => $store.state.course.course);

    const newBillErrorMessages = computed(() => getBillErrorMessages('newBill.mainFee'));

    const mainFeeErrorMessages = computed(() => getBillErrorMessages('editedBill.mainFee'));

    const newBillingPurchaseErrorMessages = computed(() => getBillErrorMessages('newBillingPurchase'));

    const editedBillingPurchaseErrorMessages = computed(() => getBillErrorMessages('editedBillingPurchase'));

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

    const refreshCourseFundingOrganisations = async () => {
      try {
        const organisations = await CourseFundingOrganisations.list();
        payerList.value = formatAndSortOptions(
          [...organisations, { _id: '', name: course.value.company.name }],
          'name'
        );
      } catch (e) {
        console.error(e);
        payerList.value = [];
        NotifyNegative('Erreur lors de la récupération des financeurs.');
      }
    };

    const refreshCourseBills = async () => {
      try {
        billsLoading.value = true;
        courseBills.value = await CourseBills.list({ course: course.value._id, action: LIST });
      } catch (e) {
        console.error(e);
        courseBills.value = [];
        NotifyNegative('Erreur lors de la récupération des factures.');
      } finally {
        billsLoading.value = false;
      }
    };

    const refreshBillingItems = async () => {
      try {
        billsLoading.value = true;
        const billingItems = await CourseBillingItems.list();
        billingItemList.value = formatAndSortOptions([...billingItems], 'name');
      } catch (e) {
        console.error(e);
        billingItemList.value = [];
        NotifyNegative('Erreur lors de la récupération des articles de facturation.');
      } finally {
        billsLoading.value = false;
      }
    };

    const openBillCreationModal = () => { billCreationModal.value = true; };

    const setEditedBill = (bill) => {
      const funder = get(bill, 'courseFundingOrganisation._id') || '';
      editedBill.value = {
        _id: bill._id,
        funder,
        mainFee: { price: bill.mainFee.price, count: bill.mainFee.count, description: bill.mainFee.description },
      };
    };

    const openFunderEditionModal = (bill) => {
      if (isBilled(bill)) return null;

      setEditedBill(bill);
      funderEditionModal.value = true;
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
      newBill.value = { funder: '', mainFee: { price: 0, count: 1 } };
      validations.value.newBill.$reset();
    };

    const resetEditedBill = () => {
      editedBill.value = { _id: '', funder: '', mainFee: { price: '', description: '', count: '' } };
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

    const addBill = async () => {
      try {
        validations.value.newBill.$touch();
        if (validations.value.newBill.$error) return NotifyWarning('Champ(s) invalide(s)');

        billCreationLoading.value = true;
        await CourseBills.create({
          course: course.value._id,
          mainFee: newBill.value.mainFee,
          company: course.value.company._id,
          ...(!!newBill.value.funder && { courseFundingOrganisation: newBill.value.funder }),
        });
        NotifyPositive('Facture créée.');

        billCreationModal.value = false;
        await refreshCourseBills();
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
          { courseFundingOrganisation: editedBill.value.funder, mainFee: editedBill.value.mainFee }
        );
        NotifyPositive('Facture modifiée.');

        funderEditionModal.value = false;
        mainFeeEditionModal.value = false;
        await refreshCourseBills();
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
        await refreshCourseBills();
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
        await refreshCourseBills();
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
        await refreshCourseBills();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'article.');
      }
    };

    const validatePurchaseDeletion = (billId, purchaseId) => {
      $q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cet article ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => deleteBillingPurchase(billId, purchaseId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    };

    const openCreditNoteCreationModal = (bill) => {
      newCreditNote.value = {
        courseBill: bill._id,
        date: '',
        misc: '',
        company: course.value.company._id,
      };
      creditNoteCreationModal.value = true;
      minCourseCreditNoteDate.value = bill.billedAt;
    };

    const addCreditNote = async () => {
      try {
        validations.value.newCreditNote.$touch();
        if (validations.value.newCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        creditNoteCreationLoading.value = true;

        await CourseCreditNotes.create(newCreditNote.value);
        NotifyPositive('Avoir créé.');

        creditNoteCreationModal.value = false;
        await refreshCourseBills();
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
        await refreshCourseBills();
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

    const canAddBill = computed(() => courseBills.value.every(bill => bill.courseCreditNote));

    const showDetails = (billId) => {
      areDetailsVisible.value[billId] = !areDetailsVisible.value[billId];
    };

    const isFunderVisible = bill => !bill.courseCreditNote || areDetailsVisible.value[bill._id];

    const isDateVisible = bill => isFunderVisible(bill) && bill.billedAt;

    const getBillingItemName = billingItem => billingItemList.value.find(item => item.value === billingItem).label;

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

    const created = async () => {
      refreshCourseBills();
      refreshCourseFundingOrganisations();
      refreshBillingItems();
    };

    created();

    return {
      // Data
      billCreationLoading,
      billEditionLoading,
      billsLoading,
      pdfLoading,
      billingPurchaseCreationLoading,
      billingPurchaseEditionLoading,
      creditNoteCreationLoading,
      billValidationLoading,
      billCreationModal,
      funderEditionModal,
      mainFeeEditionModal,
      billingPurchaseAdditionModal,
      billingPurchaseEditionModal,
      creditNoteCreationModal,
      courseBillValidationModal,
      newBill,
      newBillingPurchase,
      editedBillingPurchase,
      billingItemList,
      editedBill,
      newCreditNote,
      billToValidate,
      payerList,
      courseBills,
      courseFeeEditionModalMetaInfo,
      areDetailsVisible,
      minCourseCreditNoteDate,
      // Computed
      validations,
      course,
      newBillErrorMessages,
      mainFeeErrorMessages,
      newBillingPurchaseErrorMessages,
      editedBillingPurchaseErrorMessages,
      canAddBill,
      // Methods
      refreshCourseFundingOrganisations,
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
      openFunderEditionModal,
      openMainFeeEditionModal,
      openBillingPurchaseAdditionModal,
      openBillingPurchaseEditionModal,
      openCreditNoteCreationModal,
      openCourseBillValidationModal,
      validatePurchaseDeletion,
      refreshCourseBills,
      refreshBillingItems,
      isDateVisible,
      isFunderVisible,
      showDetails,
      getBillingItemName,
      downloadBill,
      get,
      omit,
      pickBy,
      formatPrice,
      formatDate,
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
</style>
