<template>
  <div>
    <div v-if="!billsLoading" class="q-mt-lg q-mb-xl">
      <div v-if="courseBills.length">
        <p class="text-weight-bold">Infos de facturation</p>
        <div v-for="bill of courseBills" :key="bill._id">
          <q-card flat class="q-mb-sm">
            <q-card-section class="cursor-pointer row items-center" :id="bill._id" @click="showDetails(bill._id)">
              <q-item-section>
                <div class="text-weight-bold">
                  {{ bill.number || 'A facturer' }} - {{ formatPrice(bill.netInclTaxes) }}
                </div>
                <div @click.stop="openFunderEditionModal(bill._id)" class="payer">
                  Payeur : {{ get(bill, 'courseFundingOrganisation.name') || get(bill, 'company.name') }}
                  <q-icon size="16px" name="edit" color="copper-grey-500" />
                </div>
                {{ bill.billedAt ? `Date : ${formatDate(bill.billedAt)}` : '' }}
              </q-item-section>
              <q-icon size="24px" :name="areDetailsVisible[bill._id] ? 'expand_less' : 'expand_more'" />
            </q-card-section>
            <div class="bg-peach-200 q-pt-sm" v-if="areDetailsVisible[bill._id]">
              <q-card flat class="q-mx-lg q-mb-sm">
                <q-card-section class="cursor-pointer" @click="openCourseFeeEditionModal(bill._id)">
                  <div class="text-copper-500">{{ get(course, 'subProgram.program.name') }}</div>
                  <div>Prix unitaire : {{ formatPrice(get(bill, 'mainFee.price')) }}</div>
                  <div>Quantité : {{ get(bill, 'mainFee.count') }}</div>
                  <div v-if="get(bill, 'mainFee.description')" class="ellipsis">
                    Description : {{ bill.mainFee.description }}
                  </div>
                </q-card-section>
              </q-card>
              <div v-for="billingPurchase of bill.billingPurchaseList" :key="billingPurchase._id">
                <q-card flat class="q-mx-lg q-mb-sm">
                  <q-card-section class="cursor-pointer">
                    <div class="text-copper-500">
                      {{ getBillingItemName(billingPurchase.billingItem) }}
                    </div>
                    <div>Prix unitaire : {{ formatPrice(billingPurchase.price) }}</div>
                    <div>Quantité : {{ billingPurchase.count }}</div>
                    <div v-if="billingPurchase.description" class="ellipsis">
                      Description : {{ billingPurchase.description }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="row justify-end">
                <ni-button color="primary" icon="add" label="Ajouter un article"
                  :disable="billingPurchaseCreationLoading" @click="openBillingPurchaseAdditionModal(bill._id)" />
              </div>
            </div>
          </q-card>
          <div v-if="!isBilled(bill)" class="row justify-end q-mt-xl">
            <ni-button label="Facturer" color="white" class="bg-primary" icon="payment"
              @click="openCourseBillValidationModal(bill._id)" :disable="billValidationLoading" />
          </div>
        </div>
      </div>
      <div v-else class="row justify-end">
        <ni-button label="Démarrer la facturation" color="white" class="bg-primary" icon="payment"
          @click="openBillCreationModal" :disable="billCreationLoading" />
      </div>
    </div>
    <div v-else class="row justify-center q-mt-md"><q-spinner size="30px" /></div>

    <ni-bill-creation-modal v-model="billCreationModal" v-model:new-bill="newBill"
      @submit="addBill" :validations="validations.newBill" @hide="resetBillCreationModal"
      :loading="billCreationLoading" :payer-options="payerList" :error-messages="newBillErrorMessages" />

    <ni-funder-edition-modal v-model="funderEditionModal" v-model:edited-funder="editedBill.funder"
      @submit="editBill" @hide="resetEditedBillEditionModal" :loading="billEditionLoading" :payer-options="payerList" />

    <ni-course-fee-edition-modal v-model="courseFeeEditionModal" v-model:edited-bill="editedBill"
      @submit="editBill" :validations="validations.editedBill" @hide="resetEditedBillEditionModal"
      :loading="billEditionLoading" :error-messages="editedBillErrorMessages" />

    <ni-billing-purchase-addition-modal v-model="billingPurchaseAdditionModal"
      v-model:new-billing-purchase="newBillingPurchase" @submit="addBillingPurchase"
      :validations="validations.newBillingPurchase" @hide="resetBillingPurchaseAdditionModal"
      :loading="billingPurchaseCreationLoading" :billing-item-options="billingItemList"
      :error-messages="newBillingPurchaseErrorMessages" />

     <ni-course-bill-validation-modal v-model="courseBillValidationModal" v-model:bill-to-validate="billToValidate"
      @submit="validateBill" @hide="resetCourseBillValidationModal" :loading="billValidationLoading"
      :validations="validations.billToValidate" @cancel="cancelBillValidation" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import { strictPositiveNumber, integerNumber } from '@helpers/vuelidateCustomVal';
import { formatAndSortOptions, formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import CourseBillingItems from '@api/CourseBillingItems';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import { REQUIRED_LABEL } from '@data/constants';
import BillCreationModal from 'src/modules/vendor/components/billing/CourseBillCreationModal';
import FunderEditionModal from 'src/modules/vendor/components/billing/FunderEditionModal';
import CourseFeeEditionModal from 'src/modules/vendor/components/billing/CourseFeeEditionModal';
import BillingPurchaseAdditionModal from 'src/modules/vendor/components/billing/BillingPurchaseAdditionModal';
import CourseBillValidationModal from 'src/modules/vendor/components/billing/CourseBillValidationModal';

export default {
  name: 'BillingConfig',
  components: {
    'ni-bill-creation-modal': BillCreationModal,
    'ni-funder-edition-modal': FunderEditionModal,
    'ni-course-fee-edition-modal': CourseFeeEditionModal,
    'ni-billing-purchase-addition-modal': BillingPurchaseAdditionModal,
    'ni-course-bill-validation-modal': CourseBillValidationModal,
    'ni-button': Button,
  },
  setup () {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);
    const $store = useStore();

    const billCreationLoading = ref(false);
    const billEditionLoading = ref(false);
    const billingPurchaseCreationLoading = ref(false);
    const billValidationLoading = ref(false);
    const billsLoading = ref(false);
    const payerList = ref([]);
    const courseBills = ref([]);
    const billingItemList = ref([]);
    const billCreationModal = ref(false);
    const funderEditionModal = ref(false);
    const courseFeeEditionModal = ref(false);
    const billingPurchaseAdditionModal = ref(false);
    const courseBillValidationModal = ref(false);
    const newBill = ref({ funder: '', mainFee: { price: 0, count: 1 } });
    const editedBill = ref({ _id: '', title: '', funder: '', mainFee: { price: '', description: '', count: '' } });
    const newBillingPurchase = ref({ billId: '', billingItem: '', price: 0, count: 1, description: '' });
    const areDetailsVisible = ref(Object.fromEntries(courseBills.value.map(bill => [bill._id, false])));
    const billToValidate = ref({ _id: '', billedAt: '' });

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
      billToValidate: {
        billedAt: { required },
      },
    };
    const validations = useVuelidate(rules, { newBill, editedBill, newBillingPurchase, billToValidate });

    const course = computed(() => $store.state.course.course);

    const newBillErrorMessages = computed(() => getBillErrorMessages('newBill.mainFee'));

    const editedBillErrorMessages = computed(() => getBillErrorMessages('editedBill.mainFee'));

    const newBillingPurchaseErrorMessages = computed(() => getBillErrorMessages('newBillingPurchase'));

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
        courseBills.value = await CourseBills.list({ course: course.value._id });
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

    const setEditedBill = (billId) => {
      const courseBill = courseBills.value.find(bill => bill._id === billId);
      const funder = get(courseBill, 'courseFundingOrganisation._id') || '';
      editedBill.value = {
        _id: billId,
        funder,
        mainFee: {
          price: courseBill.mainFee.price,
          count: courseBill.mainFee.count,
          description: courseBill.mainFee.description,
        },
        title: get(course, 'value.subProgram.program.name'),
      };
    };

    const openFunderEditionModal = (billId) => {
      setEditedBill(billId);
      funderEditionModal.value = true;
    };

    const openCourseFeeEditionModal = (billId) => {
      setEditedBill(billId);
      courseFeeEditionModal.value = true;
    };

    const openBillingPurchaseAdditionModal = (billId) => {
      newBillingPurchase.value.billId = billId;
      billingPurchaseAdditionModal.value = true;
    };

    const openCourseBillValidationModal = (billId) => {
      billToValidate.value._id = billId;
      courseBillValidationModal.value = true;
    };

    const resetBillCreationModal = () => {
      newBill.value = { funder: '', mainFee: { price: 0, count: 1 } };
      validations.value.newBill.$reset();
    };

    const resetEditedBillEditionModal = () => {
      editedBill.value = { _id: '', title: '', funder: '', mainFee: { price: '', description: '', count: '' } };
      validations.value.editedBill.$reset();
    };

    const resetBillingPurchaseAdditionModal = () => {
      newBillingPurchase.value = { billId: '', billingItem: '', price: 0, count: 1, description: '' };
      validations.value.newBillingPurchase.$reset();
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
        courseFeeEditionModal.value = false;
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

    const showDetails = (billId) => {
      areDetailsVisible.value[billId] = !areDetailsVisible.value[billId];
    };

    const getBillingItemName = billingItem => billingItemList.value.find(item => item.value === billingItem).label;

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
      billingPurchaseCreationLoading,
      billValidationLoading,
      billCreationModal,
      funderEditionModal,
      courseFeeEditionModal,
      billingPurchaseAdditionModal,
      courseBillValidationModal,
      newBill,
      newBillingPurchase,
      billingItemList,
      editedBill,
      billToValidate,
      payerList,
      courseBills,
      // Computed
      validations,
      course,
      newBillErrorMessages,
      editedBillErrorMessages,
      newBillingPurchaseErrorMessages,
      areDetailsVisible,
      // Methods
      refreshCourseFundingOrganisations,
      resetBillCreationModal,
      resetEditedBillEditionModal,
      resetBillingPurchaseAdditionModal,
      resetCourseBillValidationModal,
      addBill,
      editBill,
      addBillingPurchase,
      validateBill,
      cancelBillValidation,
      isBilled,
      getBillErrorMessages,
      openBillCreationModal,
      openFunderEditionModal,
      openCourseFeeEditionModal,
      openBillingPurchaseAdditionModal,
      openCourseBillValidationModal,
      refreshCourseBills,
      refreshBillingItems,
      showDetails,
      getBillingItemName,
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
</style>
