import payments from '../api/Payments';

export default ({ app, router, Vue }) => {
  Vue.prototype.$payments = payments;
}
