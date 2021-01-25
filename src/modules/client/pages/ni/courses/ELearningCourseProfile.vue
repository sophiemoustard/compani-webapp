<template>
    <q-page class="client-background" padding>
      <ni-profile-header :title="courseName" />
      <div>
        <p class="text-weight-bold">Progression des participants</p>
        <q-card>
          <ni-expanding-table :data="learners" :columns="columns" :pagination="pagination" :hide-bottom="false">
            <template #row="{ props }">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'progress'">
                  <ni-progress class="progress" :value="col.value" />
                </template>
                <template v-else-if="col.name === 'expand'">
                  <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
                </template>
                <template v-else>
                  <div class="name" @click.stop="goToLearnerProfile(props.row)">{{ col.value }}</div>
                </template>
              </q-td>
            </template>
            <template #expanding-row="{ props }">
              <q-td colspan="100%">
                <div v-for="(step, stepIndex) in props.row.steps" :key="step._id" :props="props"
                  class="q-ma-sm expanding-table-expanded-row">
                  <div>
                    <q-icon :name="step.type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach'" />
                    {{ stepIndex + 1 }} - {{ step.name }}
                  </div>
                  <div class="expanding-table-progress-container">
                    <ni-progress class="expanding-table-sub-progress" :value="step.progress" />
                  </div>
                </div>
              </q-td>
            </template>
          </ni-expanding-table>
        </q-card>
      </div>
    </q-page>
</template>

<script>
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ExpandingTable from '@components/table/ExpandingTable';
import Progress from '@components/CourseProgress';
import { eLearningCourseProfileMixin } from '@mixins/eLearningCourseProfileMixin';

export default {
  name: 'ELearningCourseProfile',
  mixins: [eLearningCourseProfileMixin],
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-expanding-table': ExpandingTable,
    'ni-progress': Progress,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      course: [],
    };
  },
  computed: {
    courseName () {
      return get(this.course, 'subProgram.program.name');
    },
  },
  async created () {
    this.course = await this.getLearnersList();
  },
  methods: {
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni courses learners info', params: { learnerId: row._id, defaultTab: 'courses' } });
    },
  },
};
</script>

<style lang="stylus" scoped>
  .progress
    width: 100%
  .name
    width: fit-content;
    text-decoration: underline
    color: $primary
</style>
