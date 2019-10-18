import finalPay from '../api/FinalPay';

export default ({ app, router, Vue }) => {
  Vue.prototype.$finalPay = finalPay;
}
