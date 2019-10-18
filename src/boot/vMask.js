import { mask } from 'vue-the-mask';

export default ({ app, router, Vue }) => {
  Vue.directive('mask', mask);
}
