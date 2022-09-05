import { E_LEARNING, ON_SITE, STEP_TYPES } from '@data/constants';
import moment from '@helpers/moment';

export const happened = sameDaySlots => moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);

export const composeCourseName = (course, attachCompany = false) => {
  const companyName = (attachCompany && course.company) ? `${course.company.name} - ` : '';
  const misc = course.misc ? ` - ${course.misc}` : '';
  return companyName + course.subProgram.program.name + misc;
};

export const getStepTypeIcon = (type) => {
  if (type === E_LEARNING) return 'stay_current_portrait';
  if (type === ON_SITE) return 'mdi-teach';
  return 'videocam';
};

export const getStepTypeLabel = (value) => {
  const type = STEP_TYPES.find(t => t.value === value);
  return type ? type.label : '';
};
