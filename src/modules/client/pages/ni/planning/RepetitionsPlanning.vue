<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Gérer les répétitions" />
    <ni-select caption="Auxiliaire ou bénéficiaire" :model-value="selectedPerson" :options="activePersons"
      @update:model-value="setPerson($event)" clearable class="q-mt-xl" />
    <q-card v-if="selectedPerson" class="cell-container">
      <div class="cell-title">
        Répétitions de  <span class="text-weight-bold">{{ currentPersonName }}</span>
      </div>
      <div v-for="(repetitionList, index) of Object.values(repetitions)" :key="index">
        <q-card v-if="repetitionList.length" class="repetition-list-container q-mb-lg">
          <q-card-section class="day-container row cursor-pointer" :id="index" @click="showDetails(index)">
            <div>
              <div class="day">{{ DAYS[index] }}</div>
              <div>{{ getRepetitionNumber(repetitionList) }}</div>
            </div>
            <q-icon :name="areDetailsVisible[index] ? 'expand_less' : 'expand_more'" />
          </q-card-section>
          <div v-if="areDetailsVisible[index]" class="repetition-container">
            <div v-for="repetition of repetitionList" :key="repetition._id" class="q-mb-sm">
              <ni-repetition-cell :repetition="repetition" @delete="openDeletionModal(repetition)"
                :person-type="personType" />
            </div>
          </div>
        </q-card>
      </div>
      <div v-if="!Object.values(repetitions).flat().length">
        <q-card class="card">
          Aucune répétition associée à {{ activePersons.find(aux => aux.value === selectedPerson).label }}
        </q-card>
      </div>
    </q-card>
  </q-page>

  <ni-repetition-deletion-modal v-model="deletionModal" :current-auxiliary-name="currentPersonName"
    :repetition="currentRepetition" @hide="closeDeletionModal" @cancel="cancelDeletion"
    @confirm-deletion="canDeleteRepetition" @update-deletion-date="updateDeletionDate"
    :validations="v$.currentRepetition" :person-type="personType" />

  <ni-repetition-deletion-confirmation-modal v-model="confirmationModal" :repetition="currentRepetition"
     :loading="loading" @cancel="closeDeletionConfirmationModal" @submit="deleteRepetition" :person-type="personType" />
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useMeta } from 'quasar';
import { get } from 'lodash';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { AUXILIARY, CUSTOMER, DAYS } from '@data/constants';
import Users from '@api/Users';
import Repetitions from '@api/Repetitions';
import Customers from '@api/Customers';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import RepetitionCell from 'src/modules/client/components/planning/RepetitionCell';
import RepetitionDeletionModal from 'src/modules/client/components/planning/RepetitionDeletionModal';
import RepetitionDeletionConfirmationModal from
  'src/modules/client/components/planning/RepetitionDeletionConfirmationModal';

export default {
  name: 'RepetitionsPlanning',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-repetition-cell': RepetitionCell,
    'ni-repetition-deletion-modal': RepetitionDeletionModal,
    'ni-repetition-deletion-confirmation-modal': RepetitionDeletionConfirmationModal,
  },
  setup () {
    const metaInfo = { title: 'Gestion des répétitions' };
    useMeta(metaInfo);
    const activePersons = ref([]);
    const repetitions = ref([]);
    const selectedPerson = ref('');
    const currentRepetition = ref({});
    const $store = useStore();
    const deletionModal = ref(false);
    const confirmationModal = ref(false);
    const loading = ref(false);
    const minStartDate = ref(moment().startOf('d').toISOString());
    const maxStartDate = ref(moment(minStartDate.value).add(90, 'day').toISOString());
    const personType = ref('');
    const areDetailsVisible = ref(Object.fromEntries((Object.keys(repetitions.value).map(day => [day, false]))));

    const openDeletionModal = (repetition) => {
      currentRepetition.value = { ...repetition, dateDeletion: '' };
      deletionModal.value = true;
    };

    const closeDeletionModal = () => (deletionModal.value = false);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const currentPersonName = computed(() => {
      const name = activePersons.value.find(person => get(person, 'value') === selectedPerson.value);

      return get(name, 'label');
    });

    const getActivePersons = async () => {
      try {
        const companyId = get(loggedUser.value, 'company._id');

        const auxiliaries = formatAndSortIdentityOptions(await Users.listActive({ company: companyId }));
        const customers = formatAndSortIdentityOptions(await Customers.list({ stopped: false }));
        const formattedPersons = [
          ...auxiliaries.map(aux => ({ ...aux, type: AUXILIARY })),
          ...customers.map(cus => ({ ...cus, type: CUSTOMER })),
        ];

        return formattedPersons;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des auxiliaires et bénéficiaires.');
      }
    };

    const setPerson = (aux) => { selectedPerson.value = aux; };

    const getRepetitions = async () => {
      try {
        personType.value = get(activePersons.value.find(person => person.value === selectedPerson.value), 'type');
        const query = personType.value === AUXILIARY
          ? { auxiliary: selectedPerson.value }
          : { customer: selectedPerson.value };

        repetitions.value = await Repetitions.list(query);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des répétitions.');
      } finally {
        areDetailsVisible.value = Object.fromEntries(Object.keys(repetitions.value).map(day => [day, false]));
      }
    };

    const cancelDeletion = () => {
      deletionModal.value = false;
      NotifyPositive('Suppression annulée.');
    };

    const closeDeletionConfirmationModal = () => {
      v$.value.currentRepetition.$reset();
      confirmationModal.value = false;
    };

    const updateDeletionDate = (event) => { currentRepetition.value.dateDeletion = event; };

    const canDeleteRepetition = () => {
      v$.value.currentRepetition.$touch();

      if (v$.value.currentRepetition.dateDeletion.required.$response === false) {
        return NotifyWarning('Champ(s) invalide(s).');
      }

      if (v$.value.currentRepetition.dateDeletion.minDate.$response === false) {
        return NotifyWarning('La date ne peut pas être antérieure à la date du jour.');
      }

      if (v$.value.currentRepetition.dateDeletion.maxDate.$response === false) {
        return NotifyWarning('La date ne peut pas être postérieure à la date du jour + 90 jours.');
      }

      confirmationModal.value = true;
    };

    const deleteRepetition = async () => {
      try {
        loading.value = true;

        await Repetitions.delete(currentRepetition.value._id, { startDate: currentRepetition.value.dateDeletion });

        confirmationModal.value = false;
        deletionModal.value = false;

        NotifyPositive('Répétition supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppressioin de la répétition.');
      } finally {
        loading.value = false;
        v$.value.currentRepetition.$reset();
        refresh();
      }
    };

    const refresh = async () => getRepetitions();

    const showDetails = day => (areDetailsVisible.value[day] = !areDetailsVisible.value[day]);

    const getRepetitionNumber = (repetitionList) => {
      const repetitionNumber = repetitionList.length;
      return repetitionNumber > 1 ? `${repetitionNumber} répétitions` : `${repetitionNumber} répétition`;
    };

    watch(selectedPerson, async () => {
      if (selectedPerson.value) await getRepetitions();
    });

    const rules = {
      currentRepetition: {
        dateDeletion: { required, minDate: minDate(minStartDate.value), maxDate: maxDate(maxStartDate.value) },
      },
    };

    const v$ = useVuelidate(rules, { currentRepetition });

    const created = async () => {
      activePersons.value = await getActivePersons();
    };

    created();

    return {
      // Data
      activePersons,
      selectedPerson,
      repetitions,
      deletionModal,
      currentRepetition,
      confirmationModal,
      loading,
      personType,
      DAYS,
      // Computed
      currentPersonName,
      // Methods
      getActivePersons,
      setPerson,
      getRepetitions,
      openDeletionModal,
      closeDeletionModal,
      cancelDeletion,
      updateDeletionDate,
      canDeleteRepetition,
      deleteRepetition,
      closeDeletionConfirmationModal,
      areDetailsVisible,
      showDetails,
      getRepetitionNumber,
      // Validations
      v$,
    };
  },
};
</script>
<style lang="sass" scoped>
.cell-container
  display: flex
  flex-direction: column
  padding: 8px 16px 8px 16px
.cell-title
  font-size: 20px
  margin: 8px 0px 8px 0px
.card
  background-color: $copper-grey-100
  display: flex
  justify-content: center
  font-style: italic
  margin: 0px 0px 16px 0px
  padding: 16px
.day-container
  background: $copper-grey-50
  padding: 8px
  justify-content: space-between
  align-items: center
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.125)
.day
  font-weight: bold
  color: black
  font-size: 16px
.repetition-container
  background: white
  padding: 16px 16px 8px 16px
.repetition-list-container
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.125)
</style>
