import Vue from 'vue';
import Vuex from 'vuex';
import main from 'src/store/main';
import rh from 'src/modules/client/store/rh';
import planning from 'src/modules/client/store/planning';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    main,
    rh,
    planning,
  },
});

export default store;
