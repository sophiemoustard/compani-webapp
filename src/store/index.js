import Vue from 'vue';
import Vuex from 'vuex';
import main from 'src/store/main';
import rh from 'src/modules/client/store/rh';
import planning from 'src/modules/client/store/planning';
import program from 'src/modules/vendor/store/program';
import customer from 'src/modules/client/store/customer';
import company from 'src/modules/vendor/store/company';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    main,
    rh,
    planning,
    customer,
    program,
    company,
  },
});

export default store;
