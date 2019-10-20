import Vue from 'vue';
import Vuex from 'vuex';
import main from './main';
import rh from './rh';
import planning from './planning';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    main,
    rh,
    planning,
  },
});

export default store;
