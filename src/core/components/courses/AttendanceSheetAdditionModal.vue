<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une nouvelle <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select v-if="course.type === INTER_B2B" :model-value="newAttendanceSheet.trainee"
      :error="validations.trainee.$error" @update:model-value="update($event, 'trainee')" in-modal required-field
      caption="Participant·e" :options="traineeOptions" @blur="validations.trainee.$touch" />
    <ni-select v-else :model-value="newAttendanceSheet.date" @blur="validations.date.$touch"
      :error="validations.date.$error" @update:model-value="update($event, 'date')" :options="dateOptions"
      required-field in-modal caption="Date" />
    <ni-input in-modal caption="Feuille d'émargement" type="file" @blur="validations.file.$touch" last required-field
      :model-value="newAttendanceSheet.file" @update:model-value="update($event, 'file')"
      :extensions="[DOC_EXTENSIONS, IMAGE_EXTENSIONS]" :error="validations.file.$error" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter la feuille d'émargement" :loading="loading"
        icon-right="add" @click="submit" color="white" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { INTER_B2B, DOC_EXTENSIONS, IMAGE_EXTENSIONS, DD_MM_YYYY } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'AttendanceSheetAdditionModal',
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    newAttendanceSheet: { type: Object, default: () => ({}) },
    course: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'update:new-attendance-sheet', 'submit'],
  setup (props, { emit }) {
    const { newAttendanceSheet, course } = toRefs(props);

    const traineeOptions = computed(() => formatAndSortIdentityOptions(course.value.trainees));

    const dateOptions = computed(() => {
      const dateOptionsSet = new Set(
        course.value.slots.map(date => CompaniDate(date.startDate).startOf('day').toISO())
      );

      return [...dateOptionsSet].map(date => ({ value: date, label: CompaniDate(date).format(DD_MM_YYYY) }));
    });

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (event, prop) => emit('update:new-attendance-sheet', { ...newAttendanceSheet.value, [prop]: event });

    return {
      // Data
      INTER_B2B,
      DOC_EXTENSIONS,
      IMAGE_EXTENSIONS,
      // Computed
      traineeOptions,
      dateOptions,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
