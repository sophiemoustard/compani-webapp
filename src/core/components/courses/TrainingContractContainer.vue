<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Convention de formation</p>
    <div class="q-mb-sm">
      <ni-banner v-if="missingInfos.length ">
        <template #message>
          Il manque {{ formatQuantity('information', missingInfos.length ) }} pour générer la convention de
          formation : {{ missingInfos.join(', ') }}.
        </template>
      </ni-banner>
      <ni-bi-color-button icon="file_download" label="Générer la convention de formation"
        :disable="disableDocDownload" @click="trainingContractPriceAdditionModal = true" size="16px" />
    </div>
  </div>
  <training-contract-price-addition-modal v-model="trainingContractPriceAdditionModal"
    v-model:price="price" @submit="openTrainingContractInfosModal"
    :validations="validations.price" @hide="resetPrice" :error-message="errorMessage" />

  <training-contract-infos-modal v-model="trainingContractInfosModal" :course="course" @hide="resetPrice"
    @submit="generateTrainingContract" :loading="pdfLoading" :price="price" />
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import get from 'lodash/get';
import { required } from '@vuelidate/validators';
import Courses from '@api/Courses';
import BiColorButton from '@components/BiColorButton';
import Banner from '@components/Banner';
import { formatQuantity } from '@helpers/utils';
import TrainingContractPriceAdditionModal from '@components/courses/TrainingContractPriceAdditionModal';
import TrainingContractInfosModal from '@components/courses/TrainingContractInfosModal';
import { NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { useCourses } from '@composables/courses';
import { REQUIRED_LABEL } from '@data/constants';
import useVuelidate from '@vuelidate/core';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import { downloadFile } from '@helpers/file';

export default {
  name: 'TrainingContractContainer',
  props: {
    course: { type: Object, default: () => {} },

  },
  components: {
    'ni-bi-color-button': BiColorButton,
    'ni-banner': Banner,
    'training-contract-price-addition-modal': TrainingContractPriceAdditionModal,
    'training-contract-infos-modal': TrainingContractInfosModal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:training-contract-price'],
  setup (props) {
    const { course } = toRefs(props);

    const price = ref(0);
    const trainingContractPriceAdditionModal = ref(false);
    const trainingContractInfosModal = ref(false);

    const { pdfLoading } = useCourses(course);

    const rules = computed(() => ({ price: { required, strictPositiveNumber } }));
    const validations = useVuelidate(rules, { price });

    const missingInfos = computed(() => {
      const infos = [];
      if (!course.value.trainer._id) infos.push('l\'intervenant(e)');
      if (!course.value.slots || !course.value.slots.length) infos.push('minimum 1 créneau');
      else if (!course.value.slots.some(slot => slot.address)) infos.push('mininum 1 adresse');

      return infos;
    });

    const errorMessage = computed(() => {
      const message = '';
      if (get(validations, 'value.price.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'value.price.strictPositiveNumber.$response') === false) return 'Prix non valide';

      return message;
    });

    const disableDocDownload = computed(() => !!missingInfos.value.length || pdfLoading.value);

    const resetPrice = () => {
      if (!trainingContractInfosModal.value) price.value = 0;
      validations.value.price.$reset();
    };

    const openTrainingContractInfosModal = () => {
      validations.value.price.$touch();
      if (validations.value.price.$error) return NotifyWarning('Champ(s) invalide(s)');

      trainingContractPriceAdditionModal.value = false;
      trainingContractInfosModal.value = true;
    };
    const generateTrainingContract = async () => {
      try {
        pdfLoading.value = true;
        const pdf = await Courses.generate(course.value._id, { price: price.value });
        const pdfName = `convention_${course.value.subProgram.program.name}_${course.value.companies[0].name}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
        trainingContractInfosModal.value = false;
      } catch (error) {
        console.error(error);
        NotifyNegative('Erreur lors de la génération de la convention.');
      } finally {
        pdfLoading.value = false;
      }
    };

    return {
      // Data
      price,
      trainingContractPriceAdditionModal,
      trainingContractInfosModal,
      pdfLoading,
      // Computed
      missingInfos,
      disableDocDownload,
      errorMessage,
      validations,
      // Methods
      openTrainingContractInfosModal,
      resetPrice,
      generateTrainingContract,
      formatQuantity,
    };
  },
};
</script>
