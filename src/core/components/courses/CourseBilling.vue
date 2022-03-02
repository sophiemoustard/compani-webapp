<template>
  <div>
    <div v-if="!billsLoading" class="q-mt-lg q-mb-xl">
      <div v-if="courseBills.length">
        <p class="text-weight-bold">Infos de facturation</p>
        <div v-for="bill of courseBills" :key="bill._id">
          <q-card flat class="q-mb-sm">
            <q-card-section class="cursor-pointer row" :id="bill._id" @click="showDetails(bill._id)">
              <q-item-section>
                <div class="text-weight-bold">A facturer - {{ formatPrice(bill.netInclTaxes) }}</div>
                <div @click.stop="openFunderEditionmodal(bill._id)" class="payer">
                  Payeur : {{ get(bill, 'courseFundingOrganisation.name') || get(bill, 'company.name') }}
                  <q-icon size="16px" name="edit" color="copper-grey-500" />
                </div>
              </q-item-section>
            </q-card-section>
            <div class="bg-peach-200" v-if="areDetailsVisible[bill._id]" @click="openCourseFeeEditionModal(bill._id)">
              <q-card-section>
                <q-card flat>
                  <q-card-section class="cursor-pointer">
                    <div class="text-copper-500">{{ get(course, 'subProgram.program.name') }}</div>
                    <div>Prix unitaire : {{ formatPrice(get(bill, 'mainFee.price')) }}</div>
                    <div>Quantité : {{ get(bill, 'mainFee.count') }}</div>
                    <div v-if="get(bill, 'mainFee.description')" class="ellipsis">
                      Description : {{ bill.mainFee.description }}
                    </div>
                  </q-card-section>
                </q-card>
              </q-card-section>
            </div>
          </q-card>
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
      @submit="editBill" :validations="validations.editedBill.funder" @hide="resetEditedBillEditionModal"
      :loading="billEditionLoading" :payer-options="payerList" />

    <ni-course-fee-edition-modal v-model="courseFeeEditionModal" v-model:edited-bill="editedBill"
      @submit="editBill" :validations="validations.editedBill" @hide="resetEditedBillEditionModal"
      :loading="billEditionLoading" :error-messages="editedBillErrorMessages" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import { strictPositiveNumber, integerNumber } from '@helpers/vuelidateCustomVal';
import { formatAndSortOptions, formatPrice } from '@helpers/utils';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import CourseBills from '@api/CourseBills';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import { REQUIRED_LABEL } from '@data/constants';
import BillCreationModal from 'src/modules/vendor/components/billing/CourseBillCreationModal';
import FunderEditionModal from 'src/modules/vendor/components/billing/FunderEditionModal';
import CourseFeeEditionModal from 'src/modules/vendor/components/billing/CourseFeeEditionModal';

export default {
  name: 'BillingConfig',
  components: {
    'ni-bill-creation-modal': BillCreationModal,
    'ni-funder-edition-modal': FunderEditionModal,
    'ni-course-fee-edition-modal': CourseFeeEditionModal,
    'ni-button': Button,
  },
  setup () {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);
    const $store = useStore();

    const billCreationLoading = ref(false);
    const billEditionLoading = ref(false);
    const billsLoading = ref(false);
    const payerList = ref([]);
    const courseBills = ref([]);
    const billCreationModal = ref(false);
    const funderEditionModal = ref(false);
    const courseFeeEditionModal = ref(false);
    const newBill = ref({ funder: '', mainFee: { price: 0, count: 1 } });
    const editedBill = ref({ _id: '', title: '', funder: '', mainFee: { price: '', description: '', count: '' } });
    const areDetailsVisible = ref(Object
      .fromEntries(courseBills.value.map(bill => [bill._id, false])));

    const rules = {
      newBill: {
        funder: {},
        mainFee: {
          price: { required, strictPositiveNumber },
          count: { required, strictPositiveNumber, integerNumber },
        },
      },
      editedBill: {
        funder: {},
        mainFee: {
          price: { required, strictPositiveNumber },
          count: { required, strictPositiveNumber, integerNumber },
          description: {},
        },
      },
    };
    const validations = useVuelidate(rules, { newBill, editedBill });

    const course = computed(() => $store.state.course.course);

    const newBillErrorMessages = computed(() => getBillErrorMessages('newBill'));

    const editedBillErrorMessages = computed(() => getBillErrorMessages('editedBill'));

    const getBillErrorMessages = (bill) => {
      let price = '';
      let count = '';
      if (get(validations, `value.${bill}.mainFee.price.required.$response`) === false) price = REQUIRED_LABEL;
      if (get(validations, `value.${bill}.mainFee.price.strictPositiveNumber.$response`) === false) {
        price = 'Prix non valide';
      }

      if (get(validations, `value.${bill}.mainFee.count.required.$response`) === false) count = REQUIRED_LABEL;
      if (get(validations, `value.${bill}.mainFee.count.strictPositiveNumber.$response`) === false ||
        get(validations, `value.${bill}.mainFee.count.integerNumber.$response`) === false) {
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

    const openFunderEditionmodal = (billId) => {
      setEditedBill(billId);
      funderEditionModal.value = true;
    };

    const openCourseFeeEditionModal = (billId) => {
      setEditedBill(billId);
      courseFeeEditionModal.value = true;
    };

    const resetBillCreationModal = () => {
      newBill.value = { funder: '', mainFee: { price: 0, count: 1 } };
      validations.value.newBill.$reset();
    };

    const resetEditedBillEditionModal = () => {
      editedBill.value = { _id: '', title: '', funder: '', mainFee: { price: '', description: '', count: '' } };
      validations.value.editedBill.$reset();
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

    const showDetails = (billId) => {
      areDetailsVisible.value[billId] = !areDetailsVisible.value[billId];
    };

    const created = async () => {
      refreshCourseBills();
      refreshCourseFundingOrganisations();
    };

    created();

    return {
      // Data
      billCreationLoading,
      billEditionLoading,
      billsLoading,
      billCreationModal,
      funderEditionModal,
      courseFeeEditionModal,
      newBill,
      editedBill,
      payerList,
      courseBills,
      // Computed
      validations,
      course,
      newBillErrorMessages,
      editedBillErrorMessages,
      areDetailsVisible,
      // Methods
      refreshCourseFundingOrganisations,
      resetBillCreationModal,
      resetEditedBillEditionModal,
      addBill,
      editBill,
      getBillErrorMessages,
      openBillCreationModal,
      openFunderEditionmodal,
      openCourseFeeEditionModal,
      refreshCourseBills,
      showDetails,
      get,
      formatPrice,
    };
  },
};
</script>

<style lang="sass" scoped>
.payer
  width: fit-content
</style>
