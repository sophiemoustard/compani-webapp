import surcharges from '../api/Surcharges'

export default ({ app, router, Vue }) => {
  Vue.prototype.$surcharges = surcharges;
}
