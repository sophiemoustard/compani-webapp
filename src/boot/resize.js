import { resize } from '../directives/resizeIframe';

export default ({ app, router, Vue }) => {
  Vue.directive('resize', resize);
}
