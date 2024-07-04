import { createStore } from 'vuex';
import main from 'src/store/main';
import userProfile from 'src/store/userProfile';
import program from 'src/modules/vendor/store/program';
import company from 'src/modules/vendor/store/company';
import holding from 'src/modules/vendor/store/holding';
import questionnaire from 'src/modules/vendor/store/questionnaire';
import card from 'src/modules/vendor/store/card';
import course from 'src/store/course';

export default createStore({
  modules: { main, userProfile, program, company, holding, course, questionnaire, card },
});
