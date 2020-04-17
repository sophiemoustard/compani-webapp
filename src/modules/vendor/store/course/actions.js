import get from 'lodash/get';
import Courses from '@api/Courses';

export const getCourse = async ({ commit }, params) => {
  try {
    const course = await Courses.getById(params.courseId);
    if (!get(course, 'trainer._id')) course.trainer = { _id: '' };

    commit('saveCourse', course);
  } catch (e) {
    console.error(e);
  }
};
