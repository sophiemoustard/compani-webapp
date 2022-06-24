<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Gérer les répétitions" />
    <ni-select caption="Auxiliaires" :model-value="selectedAuxiliary" :options="activeAuxiliaries"
      @update:model-value="setAuxiliary($event)" clearable class="q-mt-xl" />
    <q-card v-if="selectedAuxiliary" class="cell-container">
      <div class="cell-title">Répétitions de  <span class="text-weight-bold">{{ getAuxiliaryName() }}</span></div>
      <div v-for="repetition of auxiliaryRepetitions" :key="repetition._id">
        <ni-repetition-cell :repetition="repetition" />
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { ref, watch } from 'vue';
import { get } from 'lodash';
import Users from '@api/Users';
import Repetitions from '@api/Repetitions';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { NotifyNegative } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import RepetitionCell from 'src/modules/client/components/planning/RepetitionCell';

export default {
  name: 'RepetitionsPlanning',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-repetition-cell': RepetitionCell,
  },
  setup () {
    const activeAuxiliaries = ref([]);
    const auxiliaryRepetitions = ref([]);
    const selectedAuxiliary = ref('');

    const getActiveAuxiliaries = async () => {
      try {
        const auxiliaries = await Users.listActive();
        return formatAndSortIdentityOptions(auxiliaries);
      } catch (e) {
        console.error(e);
      }
    };

    const setAuxiliary = (aux) => { selectedAuxiliary.value = aux; };

    const created = async () => {
      const promises = [getActiveAuxiliaries()];
      const aux = await Promise.all(promises);
      activeAuxiliaries.value = aux.flat();
    };

    const getAuxiliaryName = () => {
      const auxiliaryName = activeAuxiliaries.value.find(aux => get(aux, 'value') === selectedAuxiliary.value);
      return get(auxiliaryName, 'label');
    };

    created();

    const getAuxiliaryRepetitions = async () => {
      try {
        const promises = [await Repetitions.list({ auxiliary: selectedAuxiliary.value })];
        const repetitions = await Promise.all(promises);
        auxiliaryRepetitions.value = repetitions.flat();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des répétitions.');
      }
    };

    watch(selectedAuxiliary, async () => {
      if (selectedAuxiliary.value) await getAuxiliaryRepetitions();
    });

    return {
      // Data
      activeAuxiliaries,
      selectedAuxiliary,
      auxiliaryRepetitions,
      // Methods
      getActiveAuxiliaries,
      setAuxiliary,
      getAuxiliaryName,
      getAuxiliaryRepetitions,
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
  margin: 8px 0px 24px 0px
</style>
