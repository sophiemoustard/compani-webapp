<template>
  <ni-modal :value="value" @input="input" @hide="resetModal" container-class="modal-container-md">
    <template slot="title">
        Réutiliser une <span class="text-weight-bold">activité</span>
      </template>
      <ni-select in-modal v-model.trim="selectedProgram" caption="Programme" required-field :options="programOptions"
        inline @input="refreshActivities" />
      <template v-if="!!selectedProgram && !refreshingActivities">
        <ni-option-group v-model="reusedActivity" :options="activityOptions" caption="Activités" required-field
          type="radio" :error="validations.$error" />
        <div class="buttons q-ma-lg">
          <q-btn class="q-mr-xs" no-caps label="Dupliquer l'activité" color="primary" :loading="loading"
            icon-right="add" @click="submitDuplication" />
          <q-btn class="q-ml-xs" no-caps label="Réutiliser l'activité" color="primary" :loading="loading"
            icon-right="add" @click="submitReuse" />
        </div>
      </template>
    </ni-modal>
</template>

<script>
import Programs from '@api/Programs';
import uniqBy from 'lodash/uniqBy';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'ActivityReuseModal',
  props: {
    value: { type: Boolean, default: false },
    programOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      selectedProgram: '',
      programIsSelected: false,
      activityOptions: [],
      refreshingActivities: false,
      reusedActivity: '',
    };
  },
  methods: {
    async refreshActivities () {
      try {
        this.refreshingActivities = true;
        const program = await Programs.getById(this.selectedProgram);

        const activities = program.subPrograms
          .map(sp => sp.steps.map(s => s.activities.map(a => ({ label: a.name, value: a._id }))))
          .flat(2)
          .sort((a, b) => a.label.localeCompare(b.label));

        this.activityOptions = uniqBy(activities, a => a.value);
      } catch (e) {
        console.error(e);
      } finally {
        this.refreshingActivities = false;
        this.reusedActivity = '';
      }
    },
    resetModal () {
      this.selectedProgram = '';
      this.reusedActivity = '';
    },
    input (event) {
      this.$emit('input', event);
    },
    submitReuse () {
      this.$emit('submit-reuse', this.reusedActivity);
    },
    submitDuplication () {
      this.$emit('submit-duplication', this.reusedActivity);
    },
  },
};
</script>

<style lang="stylus" scoped>

/deep/.q-option-group
  column-count: 2

/deep/ .q-field__control-container
  justify-content: center
  padding: 0 5px 0

.buttons
  display: flex
  justify-content: space-around

</style>
