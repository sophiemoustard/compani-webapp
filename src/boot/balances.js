import balances from '../api/Balances';

export default ({ app, router, Vue }) => {
  Vue.prototype.$balances = balances;
}
