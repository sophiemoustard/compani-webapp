import customers from 'src/core/api/Customers'

export default ({ app, router, Vue }) => {
  Vue.prototype.$customers = customers;
}
