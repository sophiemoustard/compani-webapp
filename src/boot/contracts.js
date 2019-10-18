import contracts from '../api/Contracts'

export default ({ app, router, Vue }) => {
  Vue.prototype.$contracts = contracts;
}
