import Courses from '@api/Courses';

export const getCourse = async ({ commit }, params) => {
  try {
    const course = await Courses.getById(params.courseId);
    if (!course.trainers || !course.trainers.length) course.trainers = [{ _id: '' }];
    commit('saveCourse', course);
  } catch (e) {
    console.error(e);
  }
};
