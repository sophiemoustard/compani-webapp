<template>
  <ni-modal :value="value" @input="input" @hide="resetModal">
    <template slot="title">
        Réutiliser une <span class="text-weight-bold">activité</span>
      </template>
      <ni-select in-modal v-model.trim="selectedProgram" caption="Programme" required-field :options="programOptions"
        inline @input="refreshActivities" />
      <template v-if="!!selectedProgram && !refreshingActivities">
        <ni-option-group v-model="reusedActivity" :options="activityOptions" caption="Activités" required-field
         type="radio" :error="validations.$error" />
        <template slot="footer">
          <q-btn no-caps class="full-width modal-btn" label="Éditer l'activité" color="primary" :loading="loading"
            icon-right="add" @click="submit" />
        </template>
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
      }
    },
    resetModal () {
      this.selectedProgram = '';
      this.reusedActivity = '';
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit', this.reusedActivity);
    },
  },
};
</script>

<style lang="stylus" scoped>

/deep/.q-option-group
  column-count: 2

</style>
