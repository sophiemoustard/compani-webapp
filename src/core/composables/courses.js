import { computed } from 'vue';
import get from 'lodash/get';
import { INTRA, COURSE_TYPES, E_LEARNING, ON_SITE, STEP_TYPES } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';

export const useCourses = (course) => {
  const isIntraCourse = computed(() => (get(course.value, 'type') === INTRA));

  const courseType = computed(() => {
    const type = COURSE_TYPES.find(t => t.value === get(course.value, 'type'));
    return type ? type.label : '';
  });

  const trainerName = computed(() => formatIdentity(get(course.value, 'trainer.identity'), 'FL'));

  const headerInfo = computed(() => [
    { icon: 'bookmark_border', label: courseType.value },
    { icon: 'emoji_people', label: trainerName.value },
    ...(course.value.archivedAt ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
  ]);

  const happened = sameDaySlots => moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);

  const composeCourseName = (c, attachCompany = false) => {
    const companyName = (attachCompany && c.company) ? `${c.company.name} - ` : '';
    const misc = c.misc ? ` - ${c.misc}` : '';
    return companyName + c.subProgram.program.name + misc;
  };

  const getStepTypeIcon = (type) => {
    if (type === E_LEARNING) return 'stay_current_portrait';
    if (type === ON_SITE) return 'mdi-teach';
    return 'videocam';
  };

  const getStepTypeLabel = (value) => {
    const type = STEP_TYPES.find(t => t.value === value);
    return type ? type.label : '';
  };

  return {
    // Computed
    isIntraCourse,
    headerInfo,
    // Methods
    happened,
    composeCourseName,
    getStepTypeIcon,
    getStepTypeLabel,
  };
};
