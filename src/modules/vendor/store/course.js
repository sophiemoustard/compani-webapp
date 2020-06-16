import get from 'lodash/get';
import Courses from '@api/Courses';

export default {
  namespaced: true,
  state: {
    course: null,
  },
  mutations: {
    SET_COURSE: (state, data) => { state.course = !data ? data : Object.assign({}, data) },
  },
  actions: {
    fetchCourse: async ({ commit }, params) => {
      try {
        const course = await Courses.getById(params.courseId);
        if (!get(course, 'trainer._id')) course.trainer = { _id: '' };

        commit('SET_COURSE', course);
      } catch (e) {
        console.error(e);
      }
    },
    resetCourse: ({ commit }) => { commit('SET_COURSE', null) },
  },
  getters: {},
};
