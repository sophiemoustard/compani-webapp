import { resize } from 'src/core/directives/resizeIframe';

export default ({ app, router, Vue }) => {
  Vue.directive('resize', resize);
}
