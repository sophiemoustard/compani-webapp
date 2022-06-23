<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Gérer les répétitions" />
    <ni-select caption="Auxiliaires" :model-value="selectedAuxiliary" :options="activeAuxiliaries" 
      @update:model-value="setAuxiliary($event)" clearable class="q-mt-xl" />
  </q-page>
</template>

<script>
import { ref } from 'vue';
import Users from '@api/Users';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';

export default {
  name: 'RepetitionsPlanning',
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
  },
  setup () {
    const activeAuxiliaries = ref([]);
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

    created();

    return {
      // Data
      activeAuxiliaries,
      selectedAuxiliary,
      // Methods
      getActiveAuxiliaries,
      setAuxiliary,
    };
  },
};
</script>
