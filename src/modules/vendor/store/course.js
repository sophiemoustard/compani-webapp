import get from 'lodash/get';
import Courses from '@api/Courses';

export default {
  namespaced: true,
  state: {
    course: null,
  },
  mutations: {
    SAVE: (state, data) => { state.course = !data ? data : Object.assign({}, data) },
  },
  actions: {
    get: async ({ commit }, params) => {
      try {
        const course = await Courses.getById(params.courseId);
        if (!get(course, 'trainer._id')) course.trainer = { _id: '' };

        commit('SAVE', course);
      } catch (e) {
        console.error(e);
      }
    },
    reset: ({ commit }) => { commit('SAVE', null) },
  },
  getters: {},
};
