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
import { mapState } from 'vuex';
import pick from 'lodash/pick';
import ExpandingTable from '@components/table/ExpandingTable';
import Progress from '@components/CourseProgress';
import { sortStrings } from '@helpers/utils';
import { E_LEARNING } from '@data/constants.js';
import { defineAbilitiesFor } from '@helpers/ability';
import { courseMixin } from '@mixins/courseMixin';
import ConnectedDot from './ConnectedDot';

export default {
  name: 'ElearningFollowUpTable',
  mixins: [courseMixin],
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
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'identity',
          format: value => (value ? value.fullName : ''),
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: this.isBlended ? 'width: 40%' : 'width: 70%',
        },
        {
          name: 'isConnected',
          label: 'Connexion à l\'app ?',
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
      ],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      E_LEARNING,
      isClientInterface,
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    canReadLearnerInfo () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company', '_id', 'sector']));

      return ability.can('read', 'learner_info');
    },
    visibleColumns () {
      return this.isBlended
        ? ['name', 'isConnected', 'progress', 'expand']
        : ['name', 'progress', 'expand'];
    },
  },
  methods: {
    goToLearnerProfile (row, $event) {
      if (!this.canReadLearnerInfo) return;

      $event.stopPropagation();
      const name = this.isClientInterface ? 'ni courses learners info' : 'ni users learners info';
      this.$router.push({ name, params: { learnerId: row._id, defaultTab: 'courses' } });
    },
  },
};
</script>

<style lang="sass" scoped>
.progress
  width: 100%
.name
  width: fit-content
</style>
