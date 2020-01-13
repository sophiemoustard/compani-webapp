import billSlips from '../api/BillSlips';

export default ({ app, router, Vue }) => {
  Vue.prototype.$billSlips = billSlips;
}
