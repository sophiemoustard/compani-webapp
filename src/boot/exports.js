import exports from '../api/Exports';

export default ({ app, router, Vue }) => {
  Vue.prototype.$exports = exports;
}
