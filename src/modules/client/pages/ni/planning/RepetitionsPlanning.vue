<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Gérer les répétitions" />
    <ni-select caption="Auxiliaire" :model-value="selectedAuxiliary" :options="activeAuxiliaries"
      @update:model-value="setAuxiliary($event)" clearable class="q-mt-xl" />
    <q-card v-if="selectedAuxiliary" class="cell-container">
      <div class="cell-title">
        Répétitions de  <span class="text-weight-bold">{{ currentAuxiliaryName }}</span>
      </div>
      <div v-for="repetition of auxiliaryRepetitions" :key="repetition._id">
        <ni-repetition-cell :repetition="repetition" @button-click="openRepetitionDeletionModal(repetition)" />
      </div>
      <div v-if="!auxiliaryRepetitions.length">
        <q-card class="card">
          Aucune répétition associée à {{ activeAuxiliaries.find(aux => aux.value === selectedAuxiliary).label }}
        </q-card>
      </div>
    </q-card>
  </q-page>

  <ni-repetition-deletion-modal v-model="repetitionDeletionModal" :current-auxiliary-name="currentAuxiliaryName"
    :repetition="currentRepetition" @hide="closeRepetitionDeletionModal" />
</template>

<script>
import { ref, watch, computed } from 'vue';
import { get } from 'lodash';
import { useStore } from 'vuex';
import Users from '@api/Users';
import Repetitions from '@api/Repetitions';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { NotifyNegative } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import RepetitionCell from 'src/modules/client/components/planning/RepetitionCell';
import RepetitionDeletionModal from 'src/modules/client/components/planning/RepetitionDeletionModal';

export default {
  name: 'RepetitionsPlanning',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-repetition-cell': RepetitionCell,
    'ni-repetition-deletion-modal': RepetitionDeletionModal,
  },
  setup () {
    const activeAuxiliaries = ref([]);
    const auxiliaryRepetitions = ref([]);
    const selectedAuxiliary = ref('');
    const currentRepetition = ref({});
    const $store = useStore();
    const repetitionDeletionModal = ref(false);

    const openRepetitionDeletionModal = (repetition) => {
      currentRepetition.value = repetition;
      repetitionDeletionModal.value = true;
    };

    const closeRepetitionDeletionModal = () => (repetitionDeletionModal.value = false);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const currentAuxiliaryName = computed(() => {
      const auxiliaryName = activeAuxiliaries.value.find(aux => get(aux, 'value') === selectedAuxiliary.value);

      return get(auxiliaryName, 'label');
    });

    const getActiveAuxiliaries = async () => {
      try {
        const companyId = get(loggedUser.value, 'company._id');
        const auxiliaries = await Users.listActive({ company: companyId });

        return formatAndSortIdentityOptions(auxiliaries);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des auxiliaires.');
      }
    };

    const setAuxiliary = (aux) => { selectedAuxiliary.value = aux; };

    const getAuxiliaryRepetitions = async () => {
      try {
        auxiliaryRepetitions.value = await Repetitions.list({ auxiliary: selectedAuxiliary.value });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des répétitions.');
      }
    };

    watch(selectedAuxiliary, async () => {
      if (selectedAuxiliary.value) await getAuxiliaryRepetitions();
    });

    const created = async () => {
      activeAuxiliaries.value = await getActiveAuxiliaries();
    };

    created();

    return {
      // Data
      activeAuxiliaries,
      selectedAuxiliary,
      auxiliaryRepetitions,
      repetitionDeletionModal,
      currentRepetition,
      // Computed
      currentAuxiliaryName,
      // Methods
      getActiveAuxiliaries,
      setAuxiliary,
      getAuxiliaryRepetitions,
      openRepetitionDeletionModal,
      closeRepetitionDeletionModal,
    };
  },
};
</script>
<style lang="sass" scoped>
.cell-container
  display: flex
  flex-direction: column
  padding: 8px 16px
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
</style>
