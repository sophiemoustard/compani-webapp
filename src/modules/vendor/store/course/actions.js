import Courses from '@api/Courses';

export async function getCourse ({ commit }, params) {
  try {
    const course = await Courses.getById(params.courseId);
    commit('saveCourse', course);
  } catch (e) {
    console.error(e);
  }
};
