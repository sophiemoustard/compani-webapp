import customers from '../api/Customers'

export default ({ app, router, Vue }) => {
  Vue.prototype.$customers = customers;
}
