<template>
  <div>
    <p class="text-weight-bold">Progression eLearning</p>
    <ni-expanding-table :data="learners" :columns="columns" v-model:pagination="pagination" :hide-bottom="false"
      :loading="loading" :visible-columns="visibleColumns">
      <template #row="{ props }">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template v-if="col.name === 'progress'">
            <ni-progress class="progress" :value="col.value" />
          </template>
          <template v-else-if="col.name === 'expand'">
            <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
          </template>
          <template v-else-if="col.name === 'isConnected'">
            <connected-dot v-if="col.value" />
          </template>
          <template v-else>
            <div :class="['name', canReadLearnerInfo && 'clickable-name']"
              @click="goToLearnerProfile(props.row, $event)">
              {{ col.value }}
            </div>
          </template>
        </q-td>
      </template>
      <template #expanding-row="{ props }">
        <q-td colspan="100%">
          <div v-for="step in props.row.steps" :key="step._id" :props="props"
            class="q-ma-sm expanding-table-expanded-row">
            <div>
              <q-icon :name="getStepTypeIcon(step.type)" />
              {{ step.name }}
            </div>
            <div class="expanding-table-progress-container">
              <ni-progress class="expanding-table-sub-progress" :value="step.progress.eLearning" />
            </div>
          </div>
        </q-td>
      </template>
    </ni-expanding-table>
  </div>
</template>

<script>
import get from 'lodash/get';
import { computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import pick from 'lodash/pick';
import ExpandingTable from '@components/table/ExpandingTable';
import Progress from '@components/CourseProgress';
import { getStepTypeIcon } from '@helpers/courses';
import { sortStrings } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';
import { useCourses } from '@composables/courses';
import ConnectedDot from './ConnectedDot';

export default {
  name: 'ElearningFollowUpTable',
  components: {
    'ni-expanding-table': ExpandingTable,
    'ni-progress': Progress,
    'connected-dot': ConnectedDot,
  },
  props: {
    learners: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    isBlended: { type: Boolean, default: false },
  },
  setup (props) {
    const $router = useRouter();
    const $store = useStore();

    const { isBlended } = toRefs(props);

    const { isClientInterface } = useCourses();

    const columns = ref([
      {
        name: 'name',
        label: 'Nom',
        field: 'identity',
        format: value => (value ? value.fullName : ''),
        align: 'left',
        sortable: true,
        sort: (a, b) => sortStrings(a.lastname, b.lastname),
        style: isBlended ? 'width: 40%' : 'width: 70%',
      },
      {
        name: 'isConnected',
        label: 'Connexion à l\'app ?',
        field: 'firstMobileConnection',
        format: value => !!value,
        align: 'center',
      },
      {
        name: 'progress',
        label: 'Progression',
        field: row => get(row, 'progress.eLearning'),
        align: 'center',
        sortable: true,
        style: 'min-width: 150px; width: 20%',
      },
      { name: 'expand', label: '', field: '' },
    ]);
    const pagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const canReadLearnerInfo = computed(() => {
      const ability = defineAbilitiesFor(pick(loggedUser.value, ['role', 'company', '_id', 'sector']));

      return ability.can('read', 'learner_info');
    });

    const visibleColumns = computed(() => (isBlended.value
      ? ['name', 'isConnected', 'progress', 'expand']
      : ['name', 'progress', 'expand']));

    const goToLearnerProfile = (row, $event) => {
      if (!canReadLearnerInfo.value) return;

      $event.stopPropagation();
      const name = isClientInterface ? 'ni courses learners info' : 'ni users learners info';
      $router.push({ name, params: { learnerId: row._id, defaultTab: 'courses' } });
    };

    return {
      // Data
      columns,
      pagination,
      // Computed
      canReadLearnerInfo,
      visibleColumns,
      // Methods
      goToLearnerProfile,
      getStepTypeIcon,
    };
  },
};
</script>

<style lang="sass" scoped>
.progress
  width: 100%
.name
  width: fit-content
</style>
