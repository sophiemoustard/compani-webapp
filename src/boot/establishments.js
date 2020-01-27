import establishments from '../api/Establishments'

export default ({ app, router, Vue }) => {
  Vue.prototype.$establishments = establishments;
}
