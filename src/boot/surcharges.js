import surcharges from 'src/core/api/Surcharges'

export default ({ app, router, Vue }) => {
  Vue.prototype.$surcharges = surcharges;
}
