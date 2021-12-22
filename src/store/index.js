import { createStore } from 'vuex';
import main from 'src/store/main';
import userProfile from 'src/store/userProfile';
import planning from 'src/modules/client/store/planning';
import program from 'src/modules/vendor/store/program';
import customer from 'src/modules/client/store/customer';
import company from 'src/modules/vendor/store/company';
import questionnaire from 'src/modules/vendor/store/questionnaire';
import card from 'src/modules/vendor/store/card';
import course from 'src/store/course';

export default createStore({
  modules: { main, userProfile, planning, customer, program, company, course, questionnaire, card },
});
