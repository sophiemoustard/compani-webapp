<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Convention de formation</p>
    <div class="q-mb-sm">
      <ni-banner v-if="missingInfos.length">
        <template #message>
          Il manque {{ formatQuantity('information', missingInfos.length ) }} pour générer la convention de
          formation : {{ missingInfos.join(', ') }}.
        </template>
      </ni-banner>
      <div v-if="isIntraCourse">
        <ni-bi-color-button icon="file_download" label="Générer la convention de formation"
          :disable="disableDocDownload" @click="trainingContractPriceAdditionModal = true" size="16px" />
        <div class="q-mt-md row">
          <ni-file-uploader caption="Convention de formation signée" :extensions="DOC_EXTENSIONS" :url="url"
            :custom-fields="customFields" />
        </div>
      </div>
      <div v-else class="row">
        <q-card>
          <q-card-actions align="right">
            <ni-button color="primary" icon="file_download" :disable="disableDocDownload"
              label="Générer une convention de formation" @click="trainingContractPriceAdditionModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>

  <training-contract-price-addition-modal v-model="trainingContractPriceAdditionModal" :company-options="companyOptions"
    v-model:new-training-contract="newTrainingContract" @submit="openTrainingContractInfosModal" @hide="resetPrice"
    :is-intra-course="isIntraCourse" :validations="validations.newTrainingContract" :error-message="errorMessage" />

  <training-contract-infos-modal v-model="trainingContractInfosModal" :course="course" @hide="resetPrice"
    @submit="generateTrainingContract" :loading="pdfLoading" :new-training-contract="newTrainingContract"
    :is-intra-course="isIntraCourse" />
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import get from 'lodash/get';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import Courses from '@api/Courses';
import BiColorButton from '@components/BiColorButton';
import Button from '@components/Button';
import Banner from '@components/Banner';
import FileUploader from '@components/form/FileUploader';
import TrainingContractPriceAdditionModal from '@components/courses/TrainingContractPriceAdditionModal';
import TrainingContractInfosModal from '@components/courses/TrainingContractInfosModal';
import { NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { useCourses } from '@composables/courses';
import { REQUIRED_LABEL, ON_SITE, DOC_EXTENSIONS, E_LEARNING } from '@data/constants';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import { downloadFile } from '@helpers/file';
import { formatQuantity, formatDownloadName, formatAndSortOptions } from '@helpers/utils';
import { composeCourseName } from '@helpers/courses';

export default {
  name: 'TrainingContractContainer',
  props: {
    course: { type: Object, default: () => {} },
  },
  components: {
    'ni-bi-color-button': BiColorButton,
    'ni-button': Button,
    'ni-banner': Banner,
    'training-contract-price-addition-modal': TrainingContractPriceAdditionModal,
    'training-contract-infos-modal': TrainingContractInfosModal,
    'ni-file-uploader': FileUploader,
  },
  setup (props) {
    const { course } = toRefs(props);

    const { pdfLoading, isIntraCourse } = useCourses(course);

    const newTrainingContract = ref({ price: 0, company: isIntraCourse.value ? course.value.companies[0]._id : '' });
    const trainingContractPriceAdditionModal = ref(false);
    const trainingContractInfosModal = ref(false);
    const url = `${process.env.API_HOSTNAME}/trainingcontracts`;

    const rules = computed(() => ({
      newTrainingContract: { price: { required, strictPositiveNumber }, company: { required } },
    }));
    const validations = useVuelidate(rules, { newTrainingContract });

    const missingInfos = computed(() => {
      const infos = [];
      const onSiteSteps = course.value.subProgram.steps.filter(step => step.type === ON_SITE).map(step => step._id);
      const onSiteSlots = [...course.value.slots, ...course.value.slotsToPlan]
        .filter(slot => onSiteSteps.includes(slot.step));
      if (!course.value.trainer._id) infos.push('l\'intervenant(e)');
      if (!course.value.slots || !course.value.slots.length) infos.push('minimum 1 créneau');
      else if (onSiteSlots.length && !onSiteSlots.some(slot => slot.address)) infos.push('mininum 1 adresse');
      if (course.value.slotsToPlan.length) {
        const theoreticalDurationList = course.value.subProgram.steps
          .filter(step => step.type !== E_LEARNING)
          .map(step => step.theoreticalDuration);
        if (theoreticalDurationList.some(duration => !duration)) infos.push('la durée théorique dans certaines étapes');
      }

      return infos;
    });

    const errorMessage = computed(() => {
      const message = '';
      if (get(validations, 'value.newTrainingContract.price.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'value.newTrainingContract.price.strictPositiveNumber.$response') === false) {
        return 'Prix non valide';
      }

      return message;
    });

    const disableDocDownload = computed(() => !!missingInfos.value.length || pdfLoading.value);

    const customFields = computed(() => [
      { name: 'course', value: course.value._id },
      { name: 'company', value: course.value.companies[0]._id },
    ]);

    const companyOptions = computed(() => formatAndSortOptions(course.value.companies, 'name'));

    const resetPrice = () => {
      if (!trainingContractInfosModal.value) {
        newTrainingContract.value = { price: 0, company: isIntraCourse.value ? course.value.companies[0]._id : '' };
      }
      validations.value.newTrainingContract.$reset();
    };

    const openTrainingContractInfosModal = () => {
      validations.value.newTrainingContract.$touch();
      if (validations.value.newTrainingContract.$error) return NotifyWarning('Champ(s) invalide(s)');

      if (!isIntraCourse.value &&
        !course.value.trainees.some(t => t.registrationCompany === newTrainingContract.value.company)) {
        return NotifyWarning('Il n\'y a aucun(e) stagiaire rattaché(e) à la formation pour cette structure.');
      }

      trainingContractPriceAdditionModal.value = false;
      trainingContractInfosModal.value = true;
    };

    const generateTrainingContract = async () => {
      try {
        pdfLoading.value = true;
        const pdf = await Courses.downloadTrainingContract(course.value._id, newTrainingContract.value);
        const formattedName = formatDownloadName(
          `convention ${composeCourseName(course.value)} ${course.value.companies[0].name}`
        );
        const pdfName = `${formattedName}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
        trainingContractInfosModal.value = false;
      } catch (e) {
        console.error(e);
        if ([403, 422].includes(e.status)) {
          const { message } = JSON.parse(Buffer.from(e.data, 'utf8').toString('utf8'));
          return NotifyNegative(message);
        }
        NotifyNegative('Erreur lors de la génération de la convention.');
      } finally {
        pdfLoading.value = false;
      }
    };

    return {
      // Data
      newTrainingContract,
      trainingContractPriceAdditionModal,
      trainingContractInfosModal,
      pdfLoading,
      url,
      DOC_EXTENSIONS,
      // Computed
      missingInfos,
      disableDocDownload,
      errorMessage,
      validations,
      customFields,
      companyOptions,
      isIntraCourse,
      // Methods
      openTrainingContractInfosModal,
      resetPrice,
      generateTrainingContract,
      formatQuantity,
    };
  },
};
</script>
