import Sectors from '@api/Sectors';
import Users from '@api/Users';
import Customers from '@api/Customers';
import { formatIdentity } from '@helpers/utils';
import { AUXILIARY, SECTOR, PERSON, CUSTOMER } from '@data/constants';

export default {
  namespaced: true,
  state: {
    filters: [],
    elementToAdd: {},
    elementToRemove: {},
  },
  mutations: {
    SET_FILTERS: (state, elems) => { state.filters = elems; },
    SET_ELEMENT_TO_ADD: (state, elem) => { state.elementToAdd = { ...elem }; },
    SET_ELEMENT_TO_REMOVE: (state, elem) => { state.elementToRemove = { ...elem }; },
  },
  actions: {
    fillFilter: async ({ commit }, { company, roleToSearch }) => {
      const rawPromises = [];
      const elems = [];
      rawPromises.push(Sectors.list());

      if (roleToSearch === AUXILIARY) rawPromises.push(Users.listWithSectorHistories({ company: company._id }));
      else if (roleToSearch === CUSTOMER) rawPromises.push(Customers.listWithSubscriptions());

      const filterPromises = await Promise.all(rawPromises);
      const sectors = filterPromises[0];
      for (let i = 0, l = sectors.length; i < l; i++) {
        elems.push({ label: sectors[i].name, value: sectors[i]._id, _id: sectors[i]._id, type: SECTOR });
      }

      if (roleToSearch) {
        const persons = filterPromises[1];
        for (let i = 0, l = persons.length; i < l; i++) {
          elems.push({
            label: formatIdentity(persons[i].identity, 'FL'),
            value: persons[i]._id,
            ...persons[i],
            type: PERSON,
          });
        }
      }

      commit('SET_FILTERS', elems);
    },
    setElementToAdd: ({ commit }, data) => commit('SET_ELEMENT_TO_ADD', data),
    setElementToRemove: ({ commit }, data) => commit('SET_ELEMENT_TO_REMOVE', data),
    resetPlanning: ({ commit }) => {
      commit('SET_FILTERS', []);
      commit('SET_ELEMENT_TO_ADD', {});
      commit('SET_ELEMENT_TO_REMOVE', {});
    },
  },
};
