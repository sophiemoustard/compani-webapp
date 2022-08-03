import { computed } from 'vue';
import get from 'lodash/get';
import { INTRA, COURSE_TYPES } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

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

  return {
    // Computed
    isIntraCourse,
    headerInfo,
  };
};
