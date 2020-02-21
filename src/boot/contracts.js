import contracts from 'src/core/api/Contracts'

export default ({ app, router, Vue }) => {
  Vue.prototype.$contracts = contracts;
}
