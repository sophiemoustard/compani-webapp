import services from '../api/Services'

export default ({ app, router, Vue }) => {
  Vue.prototype.$services = services;
}
