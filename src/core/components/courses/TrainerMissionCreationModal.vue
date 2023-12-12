<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Téléverser <span class="text-weight-bold">un ordre de mission</span>
    </template>
    <ni-select in-modal :model-value="trainerMission.program" caption="Programme" :options="programOptions"
      required-field @update:model-value="update($event, 'program')" />
    <div v-if="trainerMission.program">
      <ni-option-group in-modal :model-value="trainerMission.courses" :options="coursesOptions" type="checkbox"
        @update:model-value="update($event, 'courses')" :error="validations.courses.$error" caption="Formations"
        required-field />
      <ni-input in-modal caption="Frais de formateur" :error="validations.fee.$error" type="number" suffix="€"
        :model-value="trainerMission.fee" @blur="validations.fee.$touch" required-field
        @update:model-value="update($event, 'fee')" error-message="Valeur non valide" />
      <ni-input in-modal caption="Ordre de mission" type="file" @blur="validations.file.$touch" last required-field
        :model-value="trainerMission.file" @update:model-value="update($event, 'file')"
        :extensions="[DOC_EXTENSIONS, IMAGE_EXTENSIONS]" :error="validations.file.$error" />
    </div>
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Téléverser l'ordre de mission" icon-right="add"
        color="white" @click="submit" :loading="loading" :disable="!trainerMission.program" />
    </template>
  </ni-modal>
</template>

<script>
import { computed, toRefs } from 'vue';
import set from 'lodash/set';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { composeCourseName } from '@helpers/courses';
import { DOC_EXTENSIONS, IMAGE_EXTENSIONS } from '@data/constants';

export default {
  name: 'TrainierMissionCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    trainerMission: { type: Object, default: () => ({}) },
    courses: { type: Array, default: () => [] },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-input': Input,
    'ni-select': Select,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:trainer-mission'],
  setup (props, { emit }) {
    const { trainerMission, courses } = toRefs(props);

    const coursesGroupedByProgram = computed(() => groupBy(courses.value, 'subProgram.program._id'));

    const programOptions = computed(() => uniqBy(courses.value.map(c => c.subProgram.program), '_id')
      .map(p => ({ label: p.name, value: p._id })));

    const coursesOptions = computed(() => coursesGroupedByProgram.value[trainerMission.value.program]
      .map(c => ({ value: c._id, label: composeCourseName(c, false) })));

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = async (event, path) => {
      if (path === 'program') await hide();
      emit('update:trainer-mission', set({ ...trainerMission.value }, path, event));
    };

    return {
      // Data
      DOC_EXTENSIONS,
      IMAGE_EXTENSIONS,
      // Computed
      coursesOptions,
      programOptions,
      coursesGroupedByProgram,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
