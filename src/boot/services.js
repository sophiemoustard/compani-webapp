import services from 'src/core/api/Services'

export default ({ app, router, Vue }) => {
  Vue.prototype.$services = services;
}
