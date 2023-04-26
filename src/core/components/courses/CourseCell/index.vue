<template>
  <q-card v-show="isDisplayed" flat class="course-card">
    <router-link :to="goToBlendedCourseProfile">
      <q-card-section>
        <div class="infos-course-nearest-date text-weight-bold">{{ formatNearestDate }}</div>
        <div class="title-text">{{ courseName }}</div>
        <div class="items-container">
          <q-item v-for="info in headerInfo" :key="info.icon" class="item-section-container">
            <q-item-section side>
              <q-icon size="12px" :name="info.icon" :class="info.iconClass" />
            </q-item-section>
            <q-item-section>{{ info.label }}</q-item-section>
          </q-item>
        </div>
        <forthcoming-section v-if="course.status === FORTHCOMING" :course="course" />
      </q-card-section>
    </router-link>
    <in-progress-section v-if="course.status === IN_PROGRESS" :course="course" />
  </q-card>
</template>

<script>
import { computed, toRefs } from 'vue';
import get from 'lodash/get';
import { useStore } from 'vuex';
import { FORTHCOMING, COMPLETED, IN_PROGRESS, TRAINER, ON_SITE, INTRA } from '@data/constants';
import { happened, composeCourseName } from '@helpers/courses';
import { formatQuantity } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import { getRoundedDiffInDays } from '@helpers/dates/utils';
import { useCourses } from '@composables/courses';
import ForthcomingSection from './ForthcomingSection';
import InProgressSection from './InProgressSection';

export default {
  name: 'CourseDetail',
  components: {
    'forthcoming-section': ForthcomingSection,
    'in-progress-section': InProgressSection,
  },
  props: {
    course: { type: Object, default: () => ({}) },
  },
  emits: ['click'],
  setup (props) {
    const $store = useStore();
    const { course } = toRefs(props);

    const { headerInfo, isVendorInterface, vendorRole } = useCourses(course);

    const selectedTrainer = computed(() => $store.state.course.selectedTrainer);
    const selectedProgram = computed(() => $store.state.course.selectedProgram);
    const selectedCompany = computed(() => $store.state.course.selectedCompany);
    const selectedSalesRepresentative = computed(() => $store.state.course.selectedSalesRepresentative);
    const selectedStartDate = computed(() => $store.state.course.selectedStartDate);
    const selectedEndDate = computed(() => $store.state.course.selectedEndDate);
    const selectedType = computed(() => $store.state.course.selectedType);
    const selectedNoAddressInSlots = computed(() => $store.state.course.selectedNoAddressInSlots);
    const selectedMissingTrainees = computed(() => $store.state.course.selectedMissingTrainees);
    const displayArchived = computed(() => $store.state.course.displayArchived);

    const isCourseAfterStartDate = computed(() => {
      const estimatedDateIsAfter = !course.value.slots.length && course.value.estimatedStartDate &&
          CompaniDate(course.value.estimatedStartDate).isSameOrAfter(selectedStartDate.value);
      const someSlotsAreAfter = course.value.slots
        .some(slotGroup => slotGroup.some(s => CompaniDate(s.startDate).isSameOrAfter(selectedStartDate.value)));

      return estimatedDateIsAfter || someSlotsAreAfter;
    });

    const isCourseBeforeEndDate = computed(() => {
      const estimatedDateIsBefore = !course.value.slots.length && course.value.estimatedStartDate &&
          CompaniDate(course.value.estimatedStartDate).isSameOrBefore(selectedEndDate.value);
      const someSlotsAreBefore = course.value.slots
        .some(slotGroup => slotGroup.some(s => CompaniDate(s.endDate).isSameOrBefore(selectedEndDate.value)));

      return estimatedDateIsBefore || someSlotsAreBefore;
    });

    const isCourseBetweenStartDateAndEndDate = computed(() => {
      const hasEstimationInRange = !course.value.slots.length && course.value.estimatedStartDate &&
          CompaniDate(course.value.estimatedStartDate).isSameOrBetween(selectedStartDate.value, selectedEndDate.value);
      const hasSlotsInRange = course.value.slots
        .some(slotGroup => slotGroup
          .some(s => CompaniDate(s.endDate).isSameOrBetween(selectedStartDate.value, selectedEndDate.value)));

      return hasEstimationInRange || hasSlotsInRange;
    });

    const hasCourseNoAddressInOnSiteSlots = computed(() => {
      const onSiteSlots = course.value.slots
        .filter(slotGroup => slotGroup.some(slot => get(slot, 'step.type') === ON_SITE));
      const hasNoAddressInOnSiteSlots = onSiteSlots.every(slotGroup => slotGroup.every(slot => !slot.address));

      return !!onSiteSlots.length && hasNoAddressInOnSiteSlots;
    });

    const doesCourseMissTrainees = computed(() => course.value.type === INTRA &&
      course.value.maxTrainees !== course.value.trainees.length);

    const isDisplayed = computed(() => {
      if (selectedProgram.value && course.value.subProgram.program._id !== selectedProgram.value) return false;

      if (selectedTrainer.value && get(course.value, 'trainer._id') !== selectedTrainer.value) return false;

      const companiesIds = course.value.companies.map(company => company._id);
      if (selectedCompany.value && !companiesIds.includes(selectedCompany.value)) return false;

      if (selectedSalesRepresentative.value &&
        course.value.salesRepresentative._id !== selectedSalesRepresentative.value) {
        return false;
      }

      if (!displayArchived.value && course.value.archivedAt) return false;

      if (selectedStartDate.value && !selectedEndDate.value && !isCourseAfterStartDate.value) return false;

      if (selectedEndDate.value && !selectedStartDate.value && !isCourseBeforeEndDate.value) return false;

      if (selectedEndDate.value && selectedStartDate.value && !isCourseBetweenStartDateAndEndDate.value) return false;

      if (selectedType.value && course.value.type !== selectedType.value) return false;

      if (selectedNoAddressInSlots.value && !hasCourseNoAddressInOnSiteSlots.value) return false;

      if (selectedMissingTrainees.value && !doesCourseMissTrainees.value) return false;

      return true;
    });

    const courseName = computed(() => composeCourseName(course.value, isVendorInterface));

    const courseSlotsCount = computed(() => course.value.slots.length);

    const formatNearestDate = computed(() => {
      if (!courseSlotsCount.value && course.value.estimatedStartDate) {
        const rangeToEstimatedStartDate = getRoundedDiffInDays(
          course.value.estimatedStartDate,
          CompaniDate().startOf('day')
        );
        if (rangeToEstimatedStartDate < 0) {
          return `Début souhaité il y a ${formatQuantity('jour', Math.abs(rangeToEstimatedStartDate))}`;
        }
        if (rangeToEstimatedStartDate) {
          return `Début souhaité dans ${formatQuantity('jour', rangeToEstimatedStartDate)}`;
        }

        return 'Début souhaité aujourd\'hui';
      }
      if (!courseSlotsCount.value && !course.value.slotsToPlan.length) return 'Pas de date prévue';
      if (!courseSlotsCount.value) return 'Prochaine date à planifier';

      if (course.value.status === FORTHCOMING) {
        const firstSlot = course.value.slots[0];
        const rangeToNextDate = getRoundedDiffInDays(
          CompaniDate(firstSlot[0].startDate).startOf('day'),
          CompaniDate().startOf('day')
        );

        return rangeToNextDate ? `Commence dans ${formatQuantity('jour', rangeToNextDate)}` : 'Commence aujourd’hui';
      }

      if (course.value.status === COMPLETED) {
        const lastSlot = course.value.slots[course.value.slots.length - 1];
        const rangeToLastDate = getRoundedDiffInDays(
          CompaniDate().startOf('day'),
          CompaniDate(lastSlot[0].startDate).startOf('day')
        );

        return rangeToLastDate
          ? `Dernière date il y a ${formatQuantity('jour', rangeToLastDate)}`
          : 'Dernière date aujourd’hui';
      }

      const nextSlot = course.value.slots.filter(daySlots => !happened(daySlots))[0];
      if (!nextSlot) return 'Prochaine date à planifier';
      const rangeToNextDate = getRoundedDiffInDays(
        CompaniDate(nextSlot[0].startDate).startOf('day'),
        CompaniDate().startOf('day')
      );

      return rangeToNextDate
        ? `Prochaine date dans ${formatQuantity('jour', rangeToNextDate)}`
        : 'Prochaine date aujourd’hui';
    });

    const goToBlendedCourseProfile = computed(() => {
      let name = '';
      if (isVendorInterface) {
        name = vendorRole.value === TRAINER ? 'trainers courses info' : 'ni management blended courses info';
      } else {
        name = 'ni courses info';
      }
      return { name, params: { courseId: course.value._id } };
    });

    return {
      // Data
      FORTHCOMING,
      IN_PROGRESS,
      // Computed
      courseName,
      formatNearestDate,
      headerInfo,
      goToBlendedCourseProfile,
      isDisplayed,
      // Methods
      happened,
    };
  },
};
</script>

<style lang="sass" scoped>
.title-text
  font-size: 14px
  color: $copper-grey-700
.items-container
  display: flex
  flex-wrap: wrap
  font-size: 12px
  color: $copper-grey-600
.item-section-container
  display: flex
.infos-course-nearest-date
  color: $copper-grey-900 !important
  font-size: 14px
</style>
